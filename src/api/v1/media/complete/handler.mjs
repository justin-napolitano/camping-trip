import { validateMediaCompleteRequest } from "../../../../contracts/index.mjs";
import { success, failure } from "../../../http.mjs";

export function handleMediaComplete(body, requestId = "req-local") {
  const valid = validateMediaCompleteRequest(body);
  if (!valid.ok) {
    return failure(422, "VALIDATION_FAILED", "Request body failed schema validation", valid.errors, requestId);
  }

  return success(200, {
    media_id: body.media_id,
    moderation_status: "flagged"
  });
}
