import { NextResponse } from "next/server";
import { initiateDeveloperControlledWalletsClient } from "@circle-fin/developer-controlled-wallets";

const client = initiateDeveloperControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, walletId } = body;

    if (action === "createWallet") {
      if (!email) {
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      // 创建 Wallet Set
      const walletSetRes = await client.createWalletSet({
        name: `ArcPay-${email}`,
      });

      const walletSetId = walletSetRes.data?.walletSet?.id;
      if (!walletSetId) {
        return NextResponse.json(
          { error: "Failed to create wallet set", detail: walletSetRes },
          { status: 500 }
        );
      }

      // 在 Arc Testnet 创建钱包
      const walletRes = await client.createWallets({
        accountType: "EOA",
        blockchains: ["ARC-TESTNET"],
        count: 1,
        walletSetId,
        metadata: [{ name: email, refId: email }],
      });

      const created = walletRes.data?.wallets?.[0];
      if (!created) {
        return NextResponse.json(
          { error: "Failed to create wallet", detail: walletRes },
          { status: 500 }
        );
      }

      return NextResponse.json({
        walletId: created.id,
        address: created.address,
        blockchain: created.blockchain,
        walletSetId,
      });
    }

    if (action === "getBalance") {
      if (!walletId) {
        return NextResponse.json({ error: "Missing walletId" }, { status: 400 });
      }

      const balances = await client.getWalletTokenBalance({
        id: walletId,
      });

      return NextResponse.json(balances.data || {});
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Wallet API error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Internal error",
        detail: error?.response?.data || String(error),
      },
      { status: 500 }
    );
  }
}