import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const reviewDir = path.join(root, "data/seed/review_intel");

const systems = [
  { id: "sys-clothing", slug: "clothing", name: "Clothing" },
  { id: "sys-sleep", slug: "sleep", name: "Sleep" },
  { id: "sys-cooking", slug: "cooking", name: "Cooking" },
  { id: "sys-water", slug: "water", name: "Water" }
];

const gearClasses = [
  { id: "cls-shell", slug: "shell-jacket", name: "Shell Jacket", required_features: ["waterproof", "hood"] },
  { id: "cls-insul", slug: "insulation-jacket", name: "Insulation Jacket", required_features: ["insulation"] },
  { id: "cls-pad", slug: "sleep-pad", name: "Sleep Pad", required_features: ["r_value"] },
  { id: "cls-bag", slug: "sleep-bag", name: "Sleep Bag", required_features: ["temp_rating"] },
  { id: "cls-stove", slug: "stove", name: "Stove", required_features: ["fuel_type"] },
  { id: "cls-pot", slug: "cook-pot", name: "Cook Pot", required_features: ["volume"] }
];

const location = {
  id: "loc-sand-rock",
  slug: "sand-rock",
  name: "Sand Rock",
  country_code: "US",
  region_code: "AL",
  latitude: 34.2357,
  longitude: -85.7833
};

const classCycle = ["cls-shell", "cls-insul", "cls-pad", "cls-bag", "cls-stove", "cls-pot"];
const gearItems = [];
for (let i = 1; i <= 25; i += 1) {
  const cls = classCycle[(i - 1) % classCycle.length];
  const mode = cls === "cls-pot" ? "non_packable" : "portable_volume_based";
  const features = {
    "cls-shell": ["waterproof", "hood"],
    "cls-insul": ["insulation"],
    "cls-pad": ["r_value"],
    "cls-bag": ["temp_rating"],
    "cls-stove": ["fuel_type"],
    "cls-pot": ["volume"]
  }[cls];
  gearItems.push({
    id: `gear-${String(i).padStart(2, "0")}`,
    slug: `gear-${String(i).padStart(2, "0")}`,
    name: `Gear Item ${i}`,
    gear_class_id: cls,
    price_usd: 49 + i * 3,
    weight_g: 200 + i * 15,
    packed_volume_l: mode === "non_packable" ? null : Number((1 + i * 0.1).toFixed(2)),
    packability_mode: mode,
    insulation_type: cls === "cls-insul" ? "synthetic" : null,
    fill_weight_g: cls === "cls-insul" ? 110 : null,
    fill_power: null,
    waterproof_mmv: cls === "cls-shell" ? 20000 : null,
    seam_sealed: cls === "cls-shell" ? true : null,
    breathability_gm2: cls === "cls-shell" ? 12000 : null,
    features_present: features,
    purchase_url: `https://example.com/gear-${String(i).padStart(2, "0")}`
  });
}

const tripProfiles = [
  {
    id: "trip-sr-001",
    location_id: "loc-sand-rock",
    trip_type: "weekend_backpacking",
    expected_low_c: 3,
    wind_mph: 10,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true
  }
];

const capabilityPolicies = [
  {
    id: "policy-v1",
    policy_version: "v1.0.0",
    medical_mild_min_c: 35,
    medical_mild_max_c: 32,
    medical_moderate_min_c: 32,
    medical_moderate_max_c: 28,
    medical_severe_lt_c: 28,
    sleep_r_thresholds_json: {
      gte_10: 2.5,
      gte_0_lt_10: 3.5,
      "gte_-6_lt_0": 4.5,
      "lt_-6": 6
    },
    fuel_buffer_multiplier: 1.3,
    field_test_recency_days: 180
  }
];

const fieldTests = [
  {
    id: "ft-001",
    gear_item_id: "gear-03",
    test_type: "sleep_overnight",
    test_date: "2026-02-01",
    expected_low_c: -2,
    passed: true,
    notes: "Sleep system held warm overnight.",
    created_by: "admin-seed"
  },
  {
    id: "ft-002",
    gear_item_id: "gear-05",
    test_type: "stove_cold_start",
    test_date: "2026-02-05",
    expected_low_c: -4,
    passed: true,
    notes: "Cold-start test passed with backup plan.",
    created_by: "admin-seed"
  }
];

for (const [name, payload] of [
  ["systems.json", systems],
  ["gear_classes.json", gearClasses],
  ["locations.json", [location]],
  ["gear_items.json", gearItems],
  ["trip_profiles.json", tripProfiles],
  ["capability_policies.json", capabilityPolicies],
  ["field_test_logs.json", fieldTests]
]) {
  fs.writeFileSync(path.join(entitiesDir, name), `${JSON.stringify(payload, null, 2)}\n`);
}

const header = [
  "gear_item_id",
  "gear_class_id",
  "location_id",
  "system_ids",
  "author_id",
  "review_date",
  "source_type",
  "source_url",
  "rating",
  "conditions_observed",
  "durability",
  "value",
  "packability",
  "usage_cycles_observed",
  "usage_runtime_hours",
  "failure_event_count",
  "repair_event_count",
  "pros",
  "cons",
  "use_case",
  "version",
  "evidence_quality"
];

const rows = [header.join(",")];
const reviewCount = 100;
for (let i = 0; i < reviewCount; i += 1) {
  const item = gearItems[i % gearItems.length];
  const sourceType = i % 10 === 0 ? "third_party_review" : "internal_admin";
  const sourceUrl = sourceType === "third_party_review" ? "https://reviews.example.com/r" : "";
  const evidenceQuality = i < 85 ? "medium" : "high";
  const reviewDate = `2026-02-${String((i % 20) + 1).padStart(2, "0")}`;
  const systemIds = item.gear_class_id.includes("sleep") ? "sys-sleep" : item.gear_class_id.includes("stove") || item.gear_class_id.includes("pot") ? "sys-cooking" : "sys-clothing";
  const row = [
    item.id,
    item.gear_class_id,
    "loc-sand-rock",
    systemIds,
    `author-${String((i % 8) + 1).padStart(2, "0")}`,
    reviewDate,
    sourceType,
    sourceUrl,
    String((i % 5) + 1),
    "Cold damp conditions with steady wind and overnight exposure details.",
    String(((i + 1) % 5) + 1),
    String(((i + 2) % 5) + 1),
    String(((i + 3) % 5) + 1),
    String(20 + (i % 10)),
    "",
    "0",
    String(i % 3 === 0 ? 1 : 0),
    "good_weatherproofing",
    "higher_weight",
    "weekend_backpacking",
    "1",
    evidenceQuality
  ];
  rows.push(row.join(","));
}

fs.writeFileSync(path.join(reviewDir, "review_intel.csv"), `${rows.join("\n")}\n`);
console.log("[seed:generate] PASS");
