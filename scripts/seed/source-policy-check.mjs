import {
  buildSourceDedupeKey,
  isTrustedDomainForSource,
  listApprovedSourceIds,
  validateRawSourceRecord
} from "../../src/seed/source-policy.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const ids = listApprovedSourceIds();
assert(ids.includes("rei_affiliate_feed"), "source policy missing rei_affiliate_feed");
assert(ids.includes("backcountry_affiliate_feed"), "source policy missing backcountry_affiliate_feed");
assert(ids.includes("manual_admin_fixture"), "source policy missing manual_admin_fixture");

assert(isTrustedDomainForSource("rei_affiliate_feed", "www.rei.com"), "rei trusted domain check failed");
assert(isTrustedDomainForSource("backcountry_affiliate_feed", "steepandcheap.com"), "backcountry family domain check failed");
assert(!isTrustedDomainForSource("rei_affiliate_feed", "example.com"), "unexpected trust for unapproved domain");

const valid = validateRawSourceRecord({
  source_id: "rei_affiliate_feed",
  source_product_id: "abc-123",
  source_url: "https://www.rei.com/product/123/demo",
  name: "Stormline Rain Shell",
  brand: "BD",
  price_usd: "189.95",
  currency: "usd",
  fetched_at: "2026-02-28T22:30:00Z"
});
assert(valid.currency === "USD", "currency normalization failed");
assert(valid.source_id === "rei_affiliate_feed", "source id normalization failed");

let blockedUnknownSource = false;
try {
  validateRawSourceRecord({
    source_id: "unknown_feed",
    source_product_id: "abc-123",
    source_url: "https://www.rei.com/product/123/demo",
    name: "Stormline Rain Shell",
    brand: "BD",
    price_usd: "189.95",
    currency: "usd",
    fetched_at: "2026-02-28T22:30:00Z"
  });
} catch (error) {
  blockedUnknownSource = error && error.code === "SOURCE_NOT_APPROVED";
}
assert(blockedUnknownSource, "unknown source was not blocked");

let blockedUntrustedDomain = false;
try {
  validateRawSourceRecord({
    source_id: "rei_affiliate_feed",
    source_product_id: "abc-123",
    source_url: "https://evil.example.com/product/123/demo",
    name: "Stormline Rain Shell",
    brand: "BD",
    price_usd: "189.95",
    currency: "usd",
    fetched_at: "2026-02-28T22:30:00Z"
  });
} catch (error) {
  blockedUntrustedDomain = error && error.code === "SOURCE_DOMAIN_UNTRUSTED";
}
assert(blockedUntrustedDomain, "untrusted domain was not blocked");

const keyA = buildSourceDedupeKey({
  source_id: "rei_affiliate_feed",
  source_product_id: "abc-123",
  normalized_brand: "black diamond",
  normalized_model: "stormline rain shell"
});
const keyB = buildSourceDedupeKey({
  source_id: "rei_affiliate_feed",
  source_product_id: "abc-123",
  normalized_brand: "black diamond",
  normalized_model: "stormline rain shell"
});
assert(keyA === keyB, "dedupe key is not deterministic");
assert(keyA.length === 64, "dedupe key must be sha256 hex");

console.log("[seed:source:check] PASS");
