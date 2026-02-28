import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { executeSql, sqlLiteral, sqlUuid } from "../../src/db/pg-shell.mjs";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const reviewCsvPath = path.join(root, "data/seed/review_intel/review_intel.csv");

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(entitiesDir, name), "utf8"));
}

function stableUuid(namespace, value) {
  const digest = createHash("sha1").update(`${namespace}:${value}`).digest("hex");
  const hex = digest.slice(0, 32).split("");
  hex[12] = "5";
  hex[16] = ((parseInt(hex[16], 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8).join("")}-${hex.slice(8, 12).join("")}-${hex.slice(12, 16).join("")}-${hex.slice(16, 20).join("")}-${hex.slice(20, 32).join("")}`;
}

function buildIdMapper() {
  const memo = new Map();
  return (kind, seedId) => {
    if (typeof seedId !== "string" || seedId.length === 0) {
      return null;
    }
    if (UUID_REGEX.test(seedId)) {
      return seedId;
    }
    const key = `${kind}:${seedId}`;
    if (!memo.has(key)) {
      memo.set(key, stableUuid(kind, seedId));
    }
    return memo.get(key);
  };
}

function parseCsvLine(line) {
  const out = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
      continue;
    }

    current += ch;
  }

  out.push(current);
  return out;
}

function readReviewCsv() {
  const lines = fs.readFileSync(reviewCsvPath, "utf8").trim().split("\n");
  if (lines.length < 2) {
    return [];
  }
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cols[idx] ?? "";
    });
    return row;
  });
}

function parseMaybeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function splitSystems(value) {
  if (!value) return [];
  return String(value)
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function classSlugToSystemSlug(classSlug) {
  if (["shell-jacket", "insulated-jacket", "base-layer"].includes(classSlug)) return "clothing";
  if (["tent"].includes(classSlug)) return "shelter";
  if (["sleeping-bag", "sleeping-pad"].includes(classSlug)) return "sleep";
  if (["stove", "cookset"].includes(classSlug)) return "cooking";
  if (["water-filter"].includes(classSlug)) return "water";
  if (["nav-device"].includes(classSlug)) return "navigation";
  if (["first-aid-kit"].includes(classSlug)) return "medical";
  return "clothing";
}

function buildCompositeScore(row) {
  const rating = Number(row.rating || 0);
  const durability = Number(row.durability || 0);
  const value = Number(row.value || 0);
  const packability = Number(row.packability || 0);
  return Number((0.4 * rating + 0.25 * durability + 0.2 * value + 0.15 * packability).toFixed(3));
}

function buildConfidenceScore(evidenceQuality) {
  const sampleSizeScore = Math.min(1, Math.log(1 + 1) / Math.log(1 + 20));
  const evidenceMap = { low: 0.3, medium: 0.6, high: 1.0 };
  const evidence = evidenceMap[evidenceQuality] ?? 0.6;
  return Number((0.5 * sampleSizeScore + 0.3 * 1.0 + 0.2 * evidence).toFixed(3));
}

async function main() {
  const mapId = buildIdMapper();

  const systems = readJson("systems.json");
  const locations = readJson("locations.json");
  const gearClasses = readJson("gear_classes.json");
  const gearItems = readJson("gear_items.json");
  const tripProfiles = readJson("trip_profiles.json");
  const capabilityPolicies = readJson("capability_policies.json");
  const fieldTests = readJson("field_test_logs.json");
  const reviews = readReviewCsv();

  const systemsBySlug = new Map();
  const gearClassSlugBySeedId = new Map();
  for (const row of gearClasses) {
    gearClassSlugBySeedId.set(row.id, row.slug);
  }

  const sql = ["BEGIN;"];

  for (const row of systems) {
    const id = mapId("system", row.id);
    systemsBySlug.set(row.slug, id);
    sql.push(`
INSERT INTO system (id, slug, name)
VALUES (${sqlUuid(id)}, ${sqlLiteral(row.slug)}, ${sqlLiteral(row.name)})
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, name = EXCLUDED.name, updated_at = now();`);
  }

  for (const row of locations) {
    const id = mapId("location", row.id);
    sql.push(`
INSERT INTO location (id, slug, name, country_code, region_code, latitude, longitude)
VALUES (
  ${sqlUuid(id)},
  ${sqlLiteral(row.slug)},
  ${sqlLiteral(row.name)},
  ${sqlLiteral(row.country_code)},
  ${sqlLiteral(row.region_code || null)},
  ${sqlLiteral(Number(row.latitude))},
  ${sqlLiteral(Number(row.longitude))}
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  country_code = EXCLUDED.country_code,
  region_code = EXCLUDED.region_code,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  updated_at = now();`);
  }

  for (const row of gearClasses) {
    const id = mapId("gear_class", row.id);
    sql.push(`
INSERT INTO gear_class (id, slug, name, required_features)
VALUES (${sqlUuid(id)}, ${sqlLiteral(row.slug)}, ${sqlLiteral(row.name)}, ${sqlLiteral(row.required_features || [])})
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  required_features = EXCLUDED.required_features,
  updated_at = now();`);
  }

  for (const row of gearItems) {
    const id = mapId("gear_item", row.id);
    const gearClassId = mapId("gear_class", row.gear_class_id);
    const canonicalSearchText = [row.name, ...(Array.isArray(row.features_present) ? row.features_present : [])].join(" ");
    sql.push(`
INSERT INTO gear_item (
  id, slug, name, gear_class_id, price_usd, purchase_url, weight_g, packed_volume_l, packability_mode,
  insulation_type, fill_weight_g, fill_power, waterproof_mmv, seam_sealed, breathability_gm2,
  features_present, canonical_search_text
)
VALUES (
  ${sqlUuid(id)},
  ${sqlLiteral(row.slug)},
  ${sqlLiteral(row.name)},
  ${sqlUuid(gearClassId)},
  ${sqlLiteral(Number(row.price_usd))},
  ${sqlLiteral(row.purchase_url || null)},
  ${sqlLiteral(Number(row.weight_g))},
  ${sqlLiteral(parseMaybeNumber(row.packed_volume_l))},
  ${sqlLiteral(row.packability_mode)},
  ${sqlLiteral(row.insulation_type || null)},
  ${sqlLiteral(parseMaybeNumber(row.fill_weight_g))},
  ${sqlLiteral(parseMaybeNumber(row.fill_power))},
  ${sqlLiteral(parseMaybeNumber(row.waterproof_mmv))},
  ${sqlLiteral(row.seam_sealed === null ? null : Boolean(row.seam_sealed))},
  ${sqlLiteral(parseMaybeNumber(row.breathability_gm2))},
  ${sqlLiteral(row.features_present || [])},
  ${sqlLiteral(canonicalSearchText)}
)
ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  name = EXCLUDED.name,
  gear_class_id = EXCLUDED.gear_class_id,
  price_usd = EXCLUDED.price_usd,
  purchase_url = EXCLUDED.purchase_url,
  weight_g = EXCLUDED.weight_g,
  packed_volume_l = EXCLUDED.packed_volume_l,
  packability_mode = EXCLUDED.packability_mode,
  insulation_type = EXCLUDED.insulation_type,
  fill_weight_g = EXCLUDED.fill_weight_g,
  fill_power = EXCLUDED.fill_power,
  waterproof_mmv = EXCLUDED.waterproof_mmv,
  seam_sealed = EXCLUDED.seam_sealed,
  breathability_gm2 = EXCLUDED.breathability_gm2,
  features_present = EXCLUDED.features_present,
  canonical_search_text = EXCLUDED.canonical_search_text,
  updated_at = now();`);
  }

  sql.push("DELETE FROM gear_item_system;");
  for (const row of gearItems) {
    const gearItemId = mapId("gear_item", row.id);
    const gearClassSlug = gearClassSlugBySeedId.get(row.gear_class_id) || "";
    const systemSlug = classSlugToSystemSlug(gearClassSlug);
    const systemId = systemsBySlug.get(systemSlug);
    if (!systemId) continue;
    sql.push(`INSERT INTO gear_item_system (gear_item_id, system_id) VALUES (${sqlUuid(gearItemId)}, ${sqlUuid(systemId)}) ON CONFLICT DO NOTHING;`);
  }

  for (const row of tripProfiles) {
    const id = mapId("trip_profile", row.id);
    const locationId = mapId("location", row.location_id);
    sql.push(`
INSERT INTO trip_profile (
  id, location_id, trip_type, expected_low_c, wind_mph, precipitation_risk, remoteness, static_exposure, precipitation_expected
)
VALUES (
  ${sqlUuid(id)},
  ${sqlUuid(locationId)},
  ${sqlLiteral(row.trip_type)}::trip_type,
  ${sqlLiteral(Number(row.expected_low_c))},
  ${sqlLiteral(Number(row.wind_mph))},
  ${sqlLiteral(row.precipitation_risk)}::precipitation_risk,
  ${sqlLiteral(row.remoteness)}::remoteness,
  ${sqlLiteral(row.static_exposure)}::static_exposure,
  ${sqlLiteral(Boolean(row.precipitation_expected))}
)
ON CONFLICT (id) DO UPDATE SET
  location_id = EXCLUDED.location_id,
  trip_type = EXCLUDED.trip_type,
  expected_low_c = EXCLUDED.expected_low_c,
  wind_mph = EXCLUDED.wind_mph,
  precipitation_risk = EXCLUDED.precipitation_risk,
  remoteness = EXCLUDED.remoteness,
  static_exposure = EXCLUDED.static_exposure,
  precipitation_expected = EXCLUDED.precipitation_expected,
  updated_at = now();`);
  }

  for (const row of capabilityPolicies) {
    const id = mapId("capability_policy", row.id);
    sql.push(`
INSERT INTO capability_policy (
  id, policy_version, medical_mild_min_c, medical_mild_max_c, medical_moderate_min_c, medical_moderate_max_c,
  medical_severe_lt_c, sleep_r_thresholds_json, fuel_buffer_multiplier, field_test_recency_days
)
VALUES (
  ${sqlUuid(id)},
  ${sqlLiteral(row.policy_version)},
  ${sqlLiteral(Number(row.medical_mild_min_c))},
  ${sqlLiteral(Number(row.medical_mild_max_c))},
  ${sqlLiteral(Number(row.medical_moderate_min_c))},
  ${sqlLiteral(Number(row.medical_moderate_max_c))},
  ${sqlLiteral(Number(row.medical_severe_lt_c))},
  ${sqlLiteral(row.sleep_r_thresholds_json || {})},
  ${sqlLiteral(Number(row.fuel_buffer_multiplier))},
  ${sqlLiteral(Number(row.field_test_recency_days))}
)
ON CONFLICT (id) DO UPDATE SET
  policy_version = EXCLUDED.policy_version,
  medical_mild_min_c = EXCLUDED.medical_mild_min_c,
  medical_mild_max_c = EXCLUDED.medical_mild_max_c,
  medical_moderate_min_c = EXCLUDED.medical_moderate_min_c,
  medical_moderate_max_c = EXCLUDED.medical_moderate_max_c,
  medical_severe_lt_c = EXCLUDED.medical_severe_lt_c,
  sleep_r_thresholds_json = EXCLUDED.sleep_r_thresholds_json,
  fuel_buffer_multiplier = EXCLUDED.fuel_buffer_multiplier,
  field_test_recency_days = EXCLUDED.field_test_recency_days,
  updated_at = now();`);
  }

  for (const row of fieldTests) {
    const id = mapId("field_test", row.id);
    const gearItemId = mapId("gear_item", row.gear_item_id);
    sql.push(`
INSERT INTO field_test_log (id, gear_item_id, test_type, test_date, expected_low_c, passed, notes, created_by)
VALUES (
  ${sqlUuid(id)},
  ${sqlUuid(gearItemId)},
  ${sqlLiteral(row.test_type)}::field_test_type,
  ${sqlLiteral(row.test_date)}::date,
  ${sqlLiteral(Number(row.expected_low_c))},
  ${sqlLiteral(Boolean(row.passed))},
  ${sqlLiteral(row.notes || "")},
  ${sqlLiteral(row.created_by || "seed-import")}
)
ON CONFLICT (id) DO UPDATE SET
  gear_item_id = EXCLUDED.gear_item_id,
  test_type = EXCLUDED.test_type,
  test_date = EXCLUDED.test_date,
  expected_low_c = EXCLUDED.expected_low_c,
  passed = EXCLUDED.passed,
  notes = EXCLUDED.notes,
  created_by = EXCLUDED.created_by;`);
  }

  sql.push("DELETE FROM review_intel_system;");
  for (const row of reviews) {
    const gearItemId = mapId("gear_item", row.gear_item_id);
    const gearClassId = mapId("gear_class", row.gear_class_id);
    const locationId = mapId("location", row.location_id);
    const reviewKey = [row.gear_item_id, row.location_id, row.review_date, row.author_id, row.source_type].join("|");
    const id = stableUuid("review_intel", reviewKey);

    const pros = row.pros ? [row.pros] : [];
    const cons = row.cons ? [row.cons] : [];
    const compositeScore = buildCompositeScore(row);
    const confidenceScore = buildConfidenceScore(row.evidence_quality);

    sql.push(`
INSERT INTO review_intel (
  id, gear_item_id, gear_class_id, location_id, author_id, review_date, source_type, source_url,
  rating, conditions_observed, durability, value, packability,
  usage_cycles_observed, usage_runtime_hours, failure_event_count, repair_event_count,
  pros, cons, use_case, evidence_quality_score, composite_score, confidence_score, version
)
VALUES (
  ${sqlUuid(id)},
  ${sqlUuid(gearItemId)},
  ${sqlUuid(gearClassId)},
  ${sqlUuid(locationId)},
  ${sqlLiteral(row.author_id)},
  ${sqlLiteral(row.review_date)}::date,
  ${sqlLiteral(row.source_type)}::source_type,
  ${sqlLiteral(row.source_url || null)},
  ${sqlLiteral(Number(row.rating))},
  ${sqlLiteral(row.conditions_observed)},
  ${sqlLiteral(Number(row.durability))},
  ${sqlLiteral(Number(row.value))},
  ${sqlLiteral(Number(row.packability))},
  ${sqlLiteral(parseMaybeNumber(row.usage_cycles_observed))},
  ${sqlLiteral(parseMaybeNumber(row.usage_runtime_hours))},
  ${sqlLiteral(parseMaybeNumber(row.failure_event_count))},
  ${sqlLiteral(parseMaybeNumber(row.repair_event_count))},
  ${sqlLiteral(pros)},
  ${sqlLiteral(cons)},
  ${sqlLiteral(row.use_case)},
  ${sqlLiteral(row.evidence_quality === "high" ? 1 : row.evidence_quality === "low" ? 0.3 : 0.6)},
  ${sqlLiteral(compositeScore)},
  ${sqlLiteral(confidenceScore)},
  ${sqlLiteral(Number(row.version || 1))}
)
ON CONFLICT (id) DO UPDATE SET
  gear_item_id = EXCLUDED.gear_item_id,
  gear_class_id = EXCLUDED.gear_class_id,
  location_id = EXCLUDED.location_id,
  author_id = EXCLUDED.author_id,
  review_date = EXCLUDED.review_date,
  source_type = EXCLUDED.source_type,
  source_url = EXCLUDED.source_url,
  rating = EXCLUDED.rating,
  conditions_observed = EXCLUDED.conditions_observed,
  durability = EXCLUDED.durability,
  value = EXCLUDED.value,
  packability = EXCLUDED.packability,
  usage_cycles_observed = EXCLUDED.usage_cycles_observed,
  usage_runtime_hours = EXCLUDED.usage_runtime_hours,
  failure_event_count = EXCLUDED.failure_event_count,
  repair_event_count = EXCLUDED.repair_event_count,
  pros = EXCLUDED.pros,
  cons = EXCLUDED.cons,
  use_case = EXCLUDED.use_case,
  evidence_quality_score = EXCLUDED.evidence_quality_score,
  composite_score = EXCLUDED.composite_score,
  confidence_score = EXCLUDED.confidence_score,
  version = EXCLUDED.version,
  updated_at = now();`);

    for (const systemSeedId of splitSystems(row.system_ids)) {
      const systemId = mapId("system", systemSeedId);
      sql.push(`INSERT INTO review_intel_system (review_intel_id, system_id) VALUES (${sqlUuid(id)}, ${sqlUuid(systemId)}) ON CONFLICT DO NOTHING;`);
    }
  }

  sql.push("DELETE FROM homepage_kit_item;");
  sql.push("DELETE FROM homepage_kit_bundle;");

  const bundle1Id = stableUuid("homepage_bundle", "wknd-1");
  const bundle2Id = stableUuid("homepage_bundle", "wknd-2");
  sql.push(`INSERT INTO homepage_kit_bundle (id, slug, name, context_key) VALUES (${sqlUuid(bundle1Id)}, 'wknd-1', 'Weekend Backpacking Baseline', 'wknd_baseline') ON CONFLICT (id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,context_key=EXCLUDED.context_key,updated_at=now();`);
  sql.push(`INSERT INTO homepage_kit_bundle (id, slug, name, context_key) VALUES (${sqlUuid(bundle2Id)}, 'wknd-2', 'Cold-Weather Weekend Backup', 'wknd_cold_backup') ON CONFLICT (id) DO UPDATE SET slug=EXCLUDED.slug,name=EXCLUDED.name,context_key=EXCLUDED.context_key,updated_at=now();`);

  const gear01 = mapId("gear_item", "gear-01");
  const gear02 = mapId("gear_item", "gear-02");
  const gear03 = mapId("gear_item", "gear-03");
  const sysClothing = systemsBySlug.get("clothing");
  const sysCooking = systemsBySlug.get("cooking");

  const itemRows = [
    {
      id: stableUuid("homepage_item", "wknd-1:gear-01"),
      bundleId: bundle1Id,
      gearItemId: gear01,
      systemId: sysClothing,
      suitabilityScore: 0.91,
      topFactors: ["rain_shell_coverage", "wind_protection", "confidence"],
      hardRuleSummary: { passed: true, failures: [] },
      purchaseUrl: "https://www.rei.com/"
    },
    {
      id: stableUuid("homepage_item", "wknd-1:gear-02"),
      bundleId: bundle1Id,
      gearItemId: gear02,
      systemId: sysClothing,
      suitabilityScore: 0.88,
      topFactors: ["static_insulation", "packability", "confidence"],
      hardRuleSummary: { passed: true, failures: [] },
      purchaseUrl: null
    },
    {
      id: stableUuid("homepage_item", "wknd-2:gear-03"),
      bundleId: bundle2Id,
      gearItemId: gear03,
      systemId: sysCooking,
      suitabilityScore: 0.87,
      topFactors: ["cold_start_validation", "fuel_margin", "redundancy"],
      hardRuleSummary: { passed: false, failures: ["fuel_margin_below_buffer"] },
      purchaseUrl: "https://www.rei.com/"
    }
  ];

  for (const row of itemRows) {
    if (!row.gearItemId || !row.systemId) {
      continue;
    }
    sql.push(`
INSERT INTO homepage_kit_item (
  id, homepage_kit_bundle_id, gear_item_id, system_id, suitability_score, top_factors, hard_rule_summary, purchase_url
)
VALUES (
  ${sqlUuid(row.id)},
  ${sqlUuid(row.bundleId)},
  ${sqlUuid(row.gearItemId)},
  ${sqlUuid(row.systemId)},
  ${sqlLiteral(row.suitabilityScore)},
  ${sqlLiteral(row.topFactors)},
  ${sqlLiteral(row.hardRuleSummary)},
  ${sqlLiteral(row.purchaseUrl)}
)
ON CONFLICT (id) DO UPDATE SET
  homepage_kit_bundle_id = EXCLUDED.homepage_kit_bundle_id,
  gear_item_id = EXCLUDED.gear_item_id,
  system_id = EXCLUDED.system_id,
  suitability_score = EXCLUDED.suitability_score,
  top_factors = EXCLUDED.top_factors,
  hard_rule_summary = EXCLUDED.hard_rule_summary,
  purchase_url = EXCLUDED.purchase_url;`);
  }

  sql.push("COMMIT;");

  await executeSql(sql.join("\n"));

  console.log(`[seed:import:db] PASS systems=${systems.length} locations=${locations.length} gear_classes=${gearClasses.length} gear_items=${gearItems.length} reviews=${reviews.length}`);
}

main().catch((error) => {
  console.error(`[seed:import:db] FAIL ${error.message}`);
  process.exit(1);
});
