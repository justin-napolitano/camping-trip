import { handleHomepageKits } from "../../../../../src/api/v1/homepage/kits/handler.mjs";
import { fetchHomepageKitsDb } from "../../../../../src/db/runtime-repository.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET() {
  try {
    const body = await fetchHomepageKitsDb();
    if (Array.isArray(body?.kits) && body.kits.length > 0) {
      return json(body, 200);
    }
  } catch {
    // Fall through to stable static handler.
  }

  const res = handleHomepageKits();
  return json(res.body, res.status);
}
