import { validateMediaUploadUrlRequest } from "../../../../contracts/index.mjs";
import { success, failure } from "../../../http.mjs";

export function handleMediaUploadUrl(body, requestId = "req-local") {
  const valid = validateMediaUploadUrlRequest(body);
  if (!valid.ok) {
    return failure(422, "VALIDATION_FAILED", "Request body failed schema validation", valid.errors, requestId);
  }

  return success(200, {
    media_id: "med-1",
    upload_url: "https://storage.example.com/signed-put",
    expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString()
  });
}
