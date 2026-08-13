import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { settings } from "@/db/schema";

export async function GET() {
  try {
    const db = getDb();
    const stamp = new Date().toISOString();

    await db
      .insert(settings)
      .values({ key: "health_check", value: stamp, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: stamp, updatedAt: new Date() },
      });

    const [row] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "health_check"))
      .limit(1);

    return Response.json({ ok: true, db: "alive", at: row?.value });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
