import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getSession } from "@/lib/admin";

export const runtime = "edge";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return Response.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${crypto.randomUUID()}.${ext}`;
  const buf = await file.arrayBuffer();

  const { env } = getCloudflareContext();
  if (!env.MEDIA) {
    return Response.json({ error: "Storage (R2) not configured" }, { status: 503 });
  }
  await env.MEDIA.put(key, buf, {
    httpMetadata: { contentType: file.type || "image/jpeg" },
  });

  return Response.json({ url: `/media/${key}` });
}
