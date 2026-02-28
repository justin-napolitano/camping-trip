import { success, failure } from "../../http.mjs";

export function handleGearDetail(slug, requestId = "req-local") {
  if (!slug) {
    return failure(404, "NOT_FOUND", "Gear not found", null, requestId);
  }
  return success(200, {
    id: "gear-01",
    slug,
    name: "Gear Item 1",
    aggregated_scores: {
      composite_score: 4.1,
      confidence_score: 0.82,
      review_count: 4
    }
  });
}
