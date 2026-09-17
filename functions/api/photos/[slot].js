import { verifySession } from "../auth.js";

const SLOTS = new Set(["groom", "bride", "photo01", "photo02", "photo03", "photo04", "photo05", "photo06"]);

export async function onRequestGet({ params, env }) {
  if (!env.PHOTOS) return new Response("Storage belum dikonfigurasi.", { status: 503 });
  const slot = params.slot;
  if (!SLOTS.has(slot)) return new Response("Not found", { status: 404 });

  const list = await env.PHOTOS.list({ prefix: `wedding/${slot}.` });
  const object = (list.objects || [])[0];
  if (!object) return new Response("Not found", { status: 404 });

  const stored = await env.PHOTOS.get(object.key);
  if (!stored) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  stored.writeHttpMetadata(headers);
  headers.set("etag", stored.httpEtag);
  headers.set("cache-control", "public, max-age=300, must-revalidate");
  return new Response(stored.body, { headers });
}

export async function onRequestOptions() {
  return new Response(null, { status: 204 });
}
