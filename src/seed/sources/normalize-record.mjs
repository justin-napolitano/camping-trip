import { buildSourceDedupeKey, validateRawSourceRecord } from "../source-policy.mjs";

const CLASS_CATALOG = [
  { slug: "shell-jacket", terms: ["shell", "rain", "waterproof"], system_slugs: ["clothing"], required_features: ["waterproof", "hood"] },
  { slug: "insulation-jacket", terms: ["insulated", "down", "puffy"], system_slugs: ["clothing"], required_features: ["insulation"] },
  { slug: "tent", terms: ["tent", "shelter"], system_slugs: ["shelter"], required_features: ["rainfly", "stakes"] },
  { slug: "sleep-pad", terms: ["pad", "sleeping pad"], system_slugs: ["sleep"], required_features: ["r_value"] },
  { slug: "sleep-bag", terms: ["sleeping bag", "quilt"], system_slugs: ["sleep"], required_features: ["temp_rating"] },
  { slug: "stove", terms: ["stove", "burner"], system_slugs: ["cooking"], required_features: ["fuel_type"] },
  { slug: "cook-pot", terms: ["pot", "cookset"], system_slugs: ["cooking"], required_features: ["volume"] },
  { slug: "water-filter", terms: ["filter", "purifier"], system_slugs: ["water"], required_features: ["flow_rate"] },
  { slug: "navigation-device", terms: ["gps", "navigation", "inreach", "satellite"], system_slugs: ["navigation-comms"], required_features: ["offline_maps"] },
  { slug: "first-aid-kit", terms: ["first aid", "medical"], system_slugs: ["medical"], required_features: ["trauma_supplies"] }
];

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

function normalizeText(value) {
  return String(value || "").toLowerCase();
}

function detectClass(raw) {
  const haystack = `${normalizeText(raw.name)} ${normalizeText(raw.category || "")} ${normalizeText(raw.subcategory || "")}`;
  for (const entry of CLASS_CATALOG) {
    if (entry.terms.some((term) => haystack.includes(term))) {
      return entry;
    }
  }
  return CLASS_CATALOG[0];
}

function parseNumberOrNull(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function inferPackabilityMode(classSlug) {
  if (classSlug === "cook-pot" || classSlug === "first-aid-kit") {
    return "non_packable";
  }
  return "portable_volume_based";
}

function buildFeatures(raw, detectedClass) {
  const sourceFeatures = Array.isArray(raw.features)
    ? raw.features.map((item) => slugify(item)).filter(Boolean)
    : [];
  const merged = new Set([...sourceFeatures, ...detectedClass.required_features]);
  return Array.from(merged);
}

export function normalizeRawSourceRecord(rawRecord) {
  const raw = validateRawSourceRecord(rawRecord);
  const detectedClass = detectClass(rawRecord || {});
  const dedupeKey = buildSourceDedupeKey({
    source_id: raw.source_id,
    source_product_id: raw.source_product_id,
    normalized_brand: raw.brand,
    normalized_model: raw.name
  });

  const canonicalName = `${raw.brand} ${raw.name}`.trim();
  const canonicalSlugBase = slugify(canonicalName) || `gear-${raw.source_product_id}`;
  const canonicalSlug = `${canonicalSlugBase}-${dedupeKey.slice(0, 6)}`;
  const weightG = parseNumberOrNull(rawRecord?.weight_g) ?? 450;
  const packedVolumeL = parseNumberOrNull(rawRecord?.packed_volume_l);
  const packabilityMode = inferPackabilityMode(detectedClass.slug);
  const featuresPresent = buildFeatures(rawRecord, detectedClass);
  const insulationType = detectedClass.slug === "insulation-jacket"
    ? String(rawRecord?.insulation_type || "synthetic").toLowerCase()
    : null;
  const fillPower = insulationType === "down" ? (parseNumberOrNull(rawRecord?.fill_power) ?? 750) : null;
  const fillWeight = insulationType ? (parseNumberOrNull(rawRecord?.fill_weight_g) ?? 100) : null;
  const waterproof = detectedClass.slug === "shell-jacket" ? (parseNumberOrNull(rawRecord?.waterproof_mmv) ?? 20000) : null;
  const seamSealed = detectedClass.slug === "shell-jacket" ? Boolean(rawRecord?.seam_sealed ?? true) : null;
  const breathability = detectedClass.slug === "shell-jacket" ? (parseNumberOrNull(rawRecord?.breathability_gm2) ?? 12000) : null;

  return {
    source_id: raw.source_id,
    source_product_id: raw.source_product_id,
    source_url: raw.source_url,
    source_dedupe_key: dedupeKey,
    raw_hash: dedupeKey,
    parser_version: raw.parser_version,
    fetched_at: raw.fetched_at,
    slug: canonicalSlug,
    name: canonicalName,
    gear_class_slug: detectedClass.slug,
    system_slugs: detectedClass.system_slugs,
    price_usd: Number(raw.price_usd.toFixed(2)),
    purchase_url: raw.source_url,
    features_present: featuresPresent,
    packability_mode: packabilityMode,
    weight_g: weightG,
    packed_volume_l: packabilityMode === "non_packable" ? null : (packedVolumeL ?? 2.2),
    insulation_type: insulationType,
    fill_weight_g: fillWeight,
    fill_power: fillPower,
    waterproof_mmv: waterproof,
    seam_sealed: seamSealed,
    breathability_gm2: breathability
  };
}
