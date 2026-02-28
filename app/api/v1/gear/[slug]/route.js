import { handleGearDetail } from "../../../../../src/api/v1/gear/detail-handler.mjs";
import { fetchGearDetailDb } from "../../../../../src/db/runtime-repository.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request, { params }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  try {
    const detail = await fetchGearDetailDb(slug);
    if (!detail) {
      const fallback = handleGearDetail(null, requestId);
      return json(fallback.body, fallback.status);
    }
    return json(detail, 200);
  } catch {
    const res = handleGearDetail(slug, requestId);
    return json(res.body, res.status);
  }
}
