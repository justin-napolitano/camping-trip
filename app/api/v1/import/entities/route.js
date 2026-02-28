import { handleImportEntities } from "../../../../../src/api/v1/import/entities/handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST() {
  const res = handleImportEntities();
  return json(res.body, res.status);
}
