import { handleMediaUploadUrl } from "../../../../../src/api/v1/media/upload-url/handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST(request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const body = await request.json();
  const res = handleMediaUploadUrl(body, requestId);
  return json(res.body, res.status);
}
