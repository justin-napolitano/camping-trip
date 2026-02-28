import { success, failure } from "../../http.mjs";

export function handleGearLocations(slug, requestId = "req-local") {
  if (!slug) {
    return failure(404, "NOT_FOUND", "Gear not found", null, requestId);
  }
  return success(200, {
    gear_slug: slug,
    locations: [
      {
        location_slug: "sand-rock",
        location_name: "Sand Rock",
        composite_score: 4.0,
        confidence_score: 0.8
      }
    ]
  });
}
