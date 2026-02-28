import { handleLocationsList } from "../../../../src/api/v1/locations/list-handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET() {
  const res = handleLocationsList();
  return json(res.body, res.status);
}
