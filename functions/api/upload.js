import { verifySession } from "./auth.js";

const SLOTS = new Set(["groom", "bride", "photo01", "photo02", "photo03", "photo04", "photo05", "photo06"]);
const MAX_SIZE = 10 * 1024 * 1024;

export async function onRequestPost({ request, env }) {
  if (!(await verifySession(request, env))) return json({ error: "Unauthorized" }, 401);
  if (!env.PHOTOS) return json({ error: "R2 binding PHOTOS belum dikonfigurasi." }, 503);

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  if (!SLOTS.has(slot)) return json({ error: "Slot foto tidak valid." }, 400);

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return json({ error: "File foto tidak ditemukan." }, 400);
  if (!file.type.startsWith("image/")) return json({ error: "File harus berupa gambar." }, 400);
  if (file.size > MAX_SIZE) return json({ error: "Ukuran maksimal 10 MB." }, 413);

  const extension = extensionFor(file.type);
  const key = `wedding/${slot}.${extension}`;

  await env.PHOTOS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { slot, uploadedAt: new Date().toISOString() }
  });

  return json({ ok: true, slot, url: `/api/photos/${slot}` });
}

export async function onRequestDelete({ request, env }) {
  if (!(await verifySession(request, env))) return json({ error: "Unauthorized" }, 401);
  if (!env.PHOTOS) return json({ error: "R2 binding PHOTOS belum dikonfigurasi." }, 503);

  const url = new URL(request.url);
  const slot = url.searchParams.get("slot");
  if (!SLOTS.has(slot)) return json({ error: "Slot foto tidak valid." }, 400);

  const list = await env.PHOTOS.list({ prefix: `wedding/${slot}.` });
  await Promise.all((list.objects || []).map(object => env.PHOTOS.delete(object.key)));

  return json({ ok: true, slot });
}

function extensionFor(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
