import { NextResponse } from "next/server";
import {
  saveOrder,
  getOrder,
  listOrdersByEmail,
  markOrderPaid,
  type OrderRecord,
} from "@/lib/orders";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === "create") {
      const { id, email, amount, description, merchantAddress } = body;
      if (!id || !email || !amount || !merchantAddress) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const order: OrderRecord = {
        id,
        email,
        amount: String(amount),
        description: description || "",
        merchantAddress,
        createdAt: new Date().toISOString(),
        paid: false,
      };
      await saveOrder(order);
      return NextResponse.json({ ok: true, order });
    }

    if (action === "get") {
      const order = await getOrder(body.id);
      if (!order) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ order });
    }

    if (action === "list") {
      if (!body.email) {
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }
      const orders = await listOrdersByEmail(body.email);
      return NextResponse.json({ orders });
    }

    if (action === "markPaid") {
      if (!body.id || !body.txHash) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
      }
      const updated = await markOrderPaid(body.id, body.txHash);
      if (!updated) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, order: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}