import { handleImportReviewIntel } from "../../../../../src/api/v1/import/review-intel/handler.mjs";

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

export async function POST() {
  const res = handleImportReviewIntel();
  return json(res.body, res.status);
}
