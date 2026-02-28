import { handleGearDetail } from "../../../../../src/api/v1/gear/detail-handler.mjs";
import { fetchGearDetailDb } from "../../../../../src/db/runtime-repository.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function GET(request, { params }) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  try {
    const detail = await fetchGearDetailDb(params?.slug);
    if (!detail) {
      const fallback = handleGearDetail(null, requestId);
      return json(fallback.body, fallback.status);
    }
    return json(
      {
        id: detail.id,
        slug: detail.slug,
        name: detail.name,
        aggregated_scores: {
          composite_score: Number(detail.composite_score),
          confidence_score: Number(detail.confidence_score),
          review_count: Number(detail.review_count)
        }
      },
      200
    );
  } catch {
    const res = handleGearDetail(params?.slug, requestId);
    return json(res.body, res.status);
  }
}
