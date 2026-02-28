import { handleGearLocations } from "../../../../../../src/api/v1/gear/locations-handler.mjs";
import { fetchGearLocationsDb } from "../../../../../../src/db/runtime-repository.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request, { params }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  try {
    const body = await fetchGearLocationsDb(params?.slug);
    if (!body) {
      const fallback = handleGearLocations(null, requestId);
      return json(fallback.body, fallback.status);
    }
    return json(body, 200);
  } catch {
    const res = handleGearLocations(params?.slug, requestId);
    return json(res.body, res.status);
  }
}
