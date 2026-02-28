import { handleGearList } from "../../../../src/api/v1/gear/list-handler.mjs";
import { fetchGearListDb } from "../../../../src/db/runtime-repository.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request) {
  const params = Object.fromEntries(new URL(request.url).searchParams.entries());
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  try {
    const body = await fetchGearListDb(params);
    return json(body, 200);
  } catch {
    const res = handleGearList(params, requestId);
    return json(res.body, res.status);
  }
}
