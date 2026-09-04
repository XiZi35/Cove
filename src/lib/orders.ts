import { Redis } from "@upstash/redis";

export type OrderRecord = {
  id: string;
  email: string;
  amount: string;
  description: string;
  merchantAddress: string;
  createdAt: string;
  paid: boolean;
  txHash?: string;
};

function redis() {
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });
}

export async function saveOrder(order: OrderRecord) {
  const r = redis();
  await r.set(`order:${order.id}`, order);
  await r.sadd(`orders:email:${order.email}`, order.id);
}

export async function getOrder(id: string): Promise<OrderRecord | null> {
  const r = redis();
  return (await r.get<OrderRecord>(`order:${id}`)) || null;
}

export async function listOrdersByEmail(
  email: string
): Promise<OrderRecord[]> {
  const r = redis();
  const ids = (await r.smembers(`orders:email:${email}`)) as string[];
  if (!ids?.length) return [];
  const orders: OrderRecord[] = [];
  for (const id of ids) {
    const o = await r.get<OrderRecord>(`order:${id}`);
    if (o) orders.push(o);
  }
  return orders.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function markOrderPaid(id: string, txHash: string) {
  const r = redis();
  const order = await r.get<OrderRecord>(`order:${id}`);
  if (!order) return null;
  const updated: OrderRecord = { ...order, paid: true, txHash };
  await r.set(`order:${id}`, updated);
  return updated;
}