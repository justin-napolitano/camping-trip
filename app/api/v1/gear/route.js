import { handleGearList } from "../../../../src/api/v1/gear/list-handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const res = handleGearList(params, requestId);
  return json(res.body, res.status);
}
