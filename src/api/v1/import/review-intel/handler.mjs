import { success } from "../../../http.mjs";

export function handleImportReviewIntel() {
  return success(202, {
    job_id: "imp-review-1",
    status: "accepted",
    rows_received: 0,
    rows_imported: 0,
    errors: []
  });
}
