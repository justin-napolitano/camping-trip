import { handleAffiliateResolve } from "../../../../../src/api/v1/affiliate/resolve-handler.mjs";

function json(body, status, requestId) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId
    }
  });
}

export async function GET(request) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const query = Object.fromEntries(new URL(request.url).searchParams.entries());
  const res = handleAffiliateResolve(query, requestId);

  if (res.status === 302 && res.location) {
    return new Response(null, {
      status: 302,
      headers: {
        location: res.location,
        "cache-control": "no-store",
        "x-request-id": requestId,
        "x-affiliate-provider": res.provider
      }
    });
  }

  return json(res.body, res.status, requestId);
}
