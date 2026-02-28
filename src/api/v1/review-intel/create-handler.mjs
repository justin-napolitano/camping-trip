import { validateReviewIntelCreate } from "../../../contracts/index.mjs";
import { success, failure } from "../../http.mjs";

export function handleReviewIntelCreate(body, requestId = "req-local") {
  const valid = validateReviewIntelCreate(body);
  if (!valid.ok) {
    return failure(422, "VALIDATION_FAILED", "Request body failed schema validation", valid.errors, requestId);
  }

  return success(201, {
    id: "rev-1",
    version: Number(body.version || 1)
  });
}
