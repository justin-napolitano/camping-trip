const PROVIDER_RULES = {
  rei: {
    domains: ["rei.com", "www.rei.com"],
    trackingParams: [
      ["utm_source", "camping-trip"],
      ["utm_medium", "affiliate"],
      ["utm_campaign", "gear-intel"],
      ["aff_source", "rei"]
    ]
  },
  backcountry: {
    domains: ["backcountry.com", "www.backcountry.com", "steepandcheap.com", "www.steepandcheap.com"],
    trackingParams: [
      ["utm_source", "camping-trip"],
      ["utm_medium", "affiliate"],
      ["utm_campaign", "gear-intel"],
      ["aff_source", "backcountry"]
    ]
  }
};

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function hostMatches(host, domain) {
  const h = normalize(host).replace(/\.$/, "");
  const d = normalize(domain).replace(/\.$/, "");
  return h === d || h.endsWith(`.${d}`);
}

function detectProvider(hostname) {
  for (const [provider, rule] of Object.entries(PROVIDER_RULES)) {
    if (rule.domains.some((domain) => hostMatches(hostname, domain))) {
      return provider;
    }
  }
  return null;
}

function ensureSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(String(rawUrl || "").trim());
  } catch {
    const error = new Error("purchase url is invalid");
    error.code = "AFFILIATE_URL_INVALID";
    throw error;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    const error = new Error("purchase url must be http or https");
    error.code = "AFFILIATE_URL_INVALID";
    throw error;
  }
  return parsed;
}

export function resolveAffiliateLink(rawUrl, context = {}) {
  const parsed = ensureSafeUrl(rawUrl);
  const provider = detectProvider(parsed.hostname);
  if (!provider) {
    const error = new Error(`untrusted affiliate domain: ${parsed.hostname}`);
    error.code = "AFFILIATE_DOMAIN_UNTRUSTED";
    throw error;
  }

  const rule = PROVIDER_RULES[provider];
  const output = new URL(parsed.toString());
  for (const [key, value] of rule.trackingParams) {
    output.searchParams.set(key, value);
  }

  const placement = normalize(context.placement);
  if (placement) {
    output.searchParams.set("aff_placement", placement);
  }
  const gearItemId = String(context.gear_item_id || "").trim();
  if (gearItemId) {
    output.searchParams.set("aff_gear_item_id", gearItemId);
  }
  const kitId = String(context.kit_id || "").trim();
  if (kitId) {
    output.searchParams.set("aff_kit_id", kitId);
  }

  return {
    provider,
    resolved_url: output.toString()
  };
}
