import { NextResponse } from "next/server";

const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!;
const CIRCLE_BASE_URL = "https://api.circle.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    if (!action) {
      return NextResponse.json({ error: "Missing action" }, { status: 400 });
    }

    // 1. 请求发送邮箱 OTP
    if (action === "requestEmailOtp") {
      const { deviceId, email } = params;
      if (!deviceId || !email) {
        return NextResponse.json(
          { error: "Missing deviceId or email" },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${CIRCLE_BASE_URL}/v1/w3s/users/email/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            deviceId,
            email,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data.data);
    }

    // 2. 初始化用户（创建钱包前必须调用）
    if (action === "initializeUser") {
      const { userToken } = params;
      if (!userToken) {
        return NextResponse.json(
          { error: "Missing userToken" },
          { status: 400 }
        );
      }

      const response = await fetch(
        `${CIRCLE_BASE_URL}/v1/w3s/user/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${CIRCLE_API_KEY}`,
            "X-User-Token": userToken,
          },
          body: JSON.stringify({
            idempotencyKey: crypto.randomUUID(),
            accountType: "SCA",
            blockchains: ["ARC-TESTNET"],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        // 用户已初始化过的错误码可以忽略
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data.data);
    }

    // 3. 获取用户钱包列表
    if (action === "listWallets") {
      const { userToken } = params;
      if (!userToken) {
        return NextResponse.json(
          { error: "Missing userToken" },
          { status: 400 }
        );
      }

      const response = await fetch(`${CIRCLE_BASE_URL}/v1/w3s/wallets`, {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${CIRCLE_API_KEY}`,
          "X-User-Token": userToken,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        return NextResponse.json(data, { status: response.status });
      }

      return NextResponse.json(data.data);
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    );
  } catch (error) {
    console.error("Circle API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}