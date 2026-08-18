import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

export function getDb() {
  const { env } = getCloudflareContext();
  // 'first-primary' anchors reads to the D1 primary (strong consistency), so
  // admin price/stock writes appear on the storefront immediately instead of
  // waiting for read-replica replication.
  return drizzle(env.DB.withSession("first-primary") as unknown as typeof env.DB, { schema });
}

export async function getDbAsync() {
  const { env } = await getCloudflareContext({ async: true });
  return drizzle(env.DB.withSession("first-primary") as unknown as typeof env.DB, { schema });
}

export type Db = ReturnType<typeof getDb>;
