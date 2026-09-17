const SLOTS = ["groom", "bride", "photo01", "photo02", "photo03", "photo04", "photo05", "photo06"];

export async function onRequestGet({ env }) {
  const result = {};
  if (!env.PHOTOS) return json(result);

  for (const slot of SLOTS) {
    const list = await env.PHOTOS.list({ prefix: `wedding/${slot}.` });
    const object = (list.objects || [])[0];
    if (object) result[slot] = `/api/photos/${slot}?v=${encodeURIComponent(object.uploaded || Date.now())}`;
  }

  return json(result);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
