import { validateGearListQuery } from "../../../contracts/index.mjs";
import { success, failure } from "../../http.mjs";

export function handleGearList(query, requestId = "req-local") {
  const valid = validateGearListQuery(query || {});
  if (!valid.ok) {
    return failure(400, "INVALID_QUERY", "Invalid gear query", valid.errors, requestId);
  }

  return success(200, {
    items: [
      {
        id: "gear-01",
        slug: "gear-01",
        name: "Gear Item 1",
        composite_score: 4.1,
        confidence_score: 0.82,
        explainability: {
          factors: ["rating", "durability", "confidence"],
          tie_break_path: ["curation_none", "composite_desc", "confidence_desc"]
        }
      }
    ],
    page: Number(query.page || 1),
    limit: Number(query.limit || 20),
    total: 1
  });
}
