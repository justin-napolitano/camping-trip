import { handleGearDetail } from "../../../../../src/api/v1/gear/detail-handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request, { params }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const res = handleGearDetail(params?.slug, requestId);
  return json(res.body, res.status);
}
