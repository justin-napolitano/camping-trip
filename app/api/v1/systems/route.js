import { handleSystemsList } from "../../../../src/api/v1/systems/list-handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET() {
  const res = handleSystemsList();
  return json(res.body, res.status);
}
