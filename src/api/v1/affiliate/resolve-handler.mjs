import { failure } from "../../http.mjs";
import { validateAffiliateResolveQuery } from "../../../contracts/index.mjs";
import { resolveAffiliateLink } from "../../../affiliate/link-builder.mjs";

export function handleAffiliateResolve(query, requestId = "req-local") {
  const validation = validateAffiliateResolveQuery(query || {});
  if (!validation.ok) {
    return failure(400, "INVALID_QUERY", "Invalid affiliate resolve query", validation.errors, requestId);
  }

  try {
    const resolved = resolveAffiliateLink(query.url, {
      placement: query.placement,
      gear_item_id: query.gear_item_id,
      kit_id: query.kit_id
    });
    return {
      status: 302,
      location: resolved.resolved_url,
      provider: resolved.provider
    };
  } catch (error) {
    const code = error && typeof error === "object" ? error.code : "";
    if (code === "AFFILIATE_URL_INVALID" || code === "AFFILIATE_DOMAIN_UNTRUSTED") {
      return failure(422, "AFFILIATE_URL_INVALID", "Affiliate link cannot be resolved", { reason: code }, requestId);
    }
    return failure(500, "INTERNAL_ERROR", "Unexpected error", null, requestId);
  }
}
