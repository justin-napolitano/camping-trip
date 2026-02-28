import { createHash } from "node:crypto";

const REQUIRED_RAW_FIELDS = [
  "source_id",
  "source_product_id",
  "source_url",
  "name",
  "brand",
  "price_usd",
  "currency",
  "fetched_at"
];

export const SOURCE_POLICY = {
  rei_affiliate_feed: {
    source_id: "rei_affiliate_feed",
    allowed_domains: ["rei.com", "www.rei.com"],
    ingestion_mode: "affiliate_feed",
    parser_version: "v1"
  },
  backcountry_affiliate_feed: {
    source_id: "backcountry_affiliate_feed",
    allowed_domains: ["backcountry.com", "www.backcountry.com", "steepandcheap.com", "www.steepandcheap.com"],
    ingestion_mode: "affiliate_feed",
    parser_version: "v1"
  },
  manual_admin_fixture: {
    source_id: "manual_admin_fixture",
    allowed_domains: ["localhost"],
    ingestion_mode: "fixture",
    parser_version: "v1"
  }
};

export function listApprovedSourceIds() {
  return Object.keys(SOURCE_POLICY).sort();
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function domainMatches(hostname, allowedDomain) {
  const host = normalizeText(hostname).replace(/\.$/, "");
  const allow = normalizeText(allowedDomain).replace(/\.$/, "");
  return host === allow || host.endsWith(`.${allow}`);
}

export function isTrustedDomainForSource(sourceId, hostname) {
  const policy = SOURCE_POLICY[sourceId];
  if (!policy) {
    return false;
  }
  return policy.allowed_domains.some((allowed) => domainMatches(hostname, allowed));
}

export function resolveSourcePolicy(sourceId) {
  const id = normalizeText(sourceId);
  const policy = SOURCE_POLICY[id];
  if (!policy) {
    const error = new Error(`unapproved source_id: ${sourceId}`);
    error.code = "SOURCE_NOT_APPROVED";
    throw error;
  }
  return policy;
}

export function assertTrustedSourceInput(input) {
  const sourceId = normalizeText(input?.source_id);
  const sourceUrl = String(input?.source_url || "").trim();
  if (!sourceUrl) {
    const error = new Error("missing source_url");
    error.code = "SOURCE_URL_MISSING";
    throw error;
  }

  const policy = resolveSourcePolicy(sourceId);
  let parsed;
  try {
    parsed = new URL(sourceUrl);
  } catch {
    const error = new Error(`invalid source_url: ${sourceUrl}`);
    error.code = "SOURCE_URL_INVALID";
    throw error;
  }

  if (parsed.protocol !== "https:") {
    const error = new Error(`source_url must use https: ${sourceUrl}`);
    error.code = "SOURCE_URL_PROTOCOL_BLOCKED";
    throw error;
  }

  if (!isTrustedDomainForSource(sourceId, parsed.hostname)) {
    const error = new Error(`untrusted domain for ${sourceId}: ${parsed.hostname}`);
    error.code = "SOURCE_DOMAIN_UNTRUSTED";
    throw error;
  }

  return {
    source_id: sourceId,
    source_url: sourceUrl,
    source_hostname: normalizeText(parsed.hostname),
    parser_version: policy.parser_version
  };
}

export function validateRawSourceRecord(record) {
  const raw = record && typeof record === "object" ? record : null;
  if (!raw) {
    const error = new Error("record must be an object");
    error.code = "SOURCE_RECORD_INVALID";
    throw error;
  }

  for (const field of REQUIRED_RAW_FIELDS) {
    const value = raw[field];
    if (value === null || value === undefined || String(value).trim() === "") {
      const error = new Error(`missing required field: ${field}`);
      error.code = "SOURCE_RECORD_FIELD_MISSING";
      throw error;
    }
  }

  const trusted = assertTrustedSourceInput({
    source_id: raw.source_id,
    source_url: raw.source_url
  });

  const price = Number(raw.price_usd);
  if (!Number.isFinite(price) || price < 0) {
    const error = new Error(`invalid price_usd: ${raw.price_usd}`);
    error.code = "SOURCE_PRICE_INVALID";
    throw error;
  }

  return {
    source_id: trusted.source_id,
    source_product_id: String(raw.source_product_id).trim(),
    source_url: trusted.source_url,
    name: String(raw.name).trim(),
    brand: String(raw.brand).trim(),
    price_usd: price,
    currency: String(raw.currency).trim().toUpperCase(),
    fetched_at: String(raw.fetched_at).trim(),
    parser_version: trusted.parser_version
  };
}

export function buildSourceDedupeKey(input) {
  const sourceId = normalizeText(input?.source_id);
  const sourceProductId = normalizeText(input?.source_product_id);
  const brand = normalizeText(input?.normalized_brand || input?.brand);
  const model = normalizeText(input?.normalized_model || input?.model || input?.name);
  const payload = `${sourceId}|${sourceProductId}|${brand}|${model}`;
  return createHash("sha256").update(payload).digest("hex");
}
