import { handleHomepageKits } from "../../../../../src/api/v1/homepage/kits/handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET() {
  const res = handleHomepageKits();
  return json(res.body, res.status);
}
