import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const reviewDir = path.join(root, "data/seed/review_intel");

const systems = [
  { id: "sys-clothing", slug: "clothing", name: "Clothing" },
  { id: "sys-shelter", slug: "shelter", name: "Shelter" },
  { id: "sys-sleep", slug: "sleep", name: "Sleep" },
  { id: "sys-cooking", slug: "cooking", name: "Cooking" },
  { id: "sys-water", slug: "water", name: "Water" },
  { id: "sys-navigation", slug: "navigation-comms", name: "Navigation and Comms" },
  { id: "sys-medical", slug: "medical", name: "Medical" }
];

const gearClasses = [
  { id: "cls-shell", slug: "shell-jacket", name: "Shell Jacket", required_features: ["waterproof", "hood"] },
  { id: "cls-insul", slug: "insulation-jacket", name: "Insulation Jacket", required_features: ["insulation"] },
  { id: "cls-tent", slug: "tent", name: "Tent", required_features: ["rainfly", "stakes"] },
  { id: "cls-pad", slug: "sleep-pad", name: "Sleep Pad", required_features: ["r_value"] },
  { id: "cls-bag", slug: "sleep-bag", name: "Sleep Bag", required_features: ["temp_rating"] },
  { id: "cls-stove", slug: "stove", name: "Stove", required_features: ["fuel_type"] },
  { id: "cls-pot", slug: "cook-pot", name: "Cook Pot", required_features: ["volume"] },
  { id: "cls-filter", slug: "water-filter", name: "Water Filter", required_features: ["flow_rate"] },
  { id: "cls-nav", slug: "navigation-device", name: "Navigation Device", required_features: ["offline_maps"] },
  { id: "cls-med", slug: "first-aid-kit", name: "First Aid Kit", required_features: ["trauma_supplies"] }
];

const locations = [
  {
    id: "loc-sand-rock",
    slug: "sand-rock",
    name: "Sand Rock",
    country_code: "US",
    region_code: "AL",
    latitude: 34.2357,
    longitude: -85.7833
  },
  {
    id: "loc-linville-gorge",
    slug: "linville-gorge",
    name: "Linville Gorge",
    country_code: "US",
    region_code: "NC",
    latitude: 35.9134,
    longitude: -81.9349
  },
  {
    id: "loc-red-river-gorge",
    slug: "red-river-gorge",
    name: "Red River Gorge",
    country_code: "US",
    region_code: "KY",
    latitude: 37.8245,
    longitude: -83.6283
  }
];

const classCycle = ["cls-shell", "cls-insul", "cls-tent", "cls-pad", "cls-bag", "cls-stove", "cls-pot", "cls-filter", "cls-nav", "cls-med"];
const classToSystem = {
  "cls-shell": "sys-clothing",
  "cls-insul": "sys-clothing",
  "cls-tent": "sys-shelter",
  "cls-pad": "sys-sleep",
  "cls-bag": "sys-sleep",
  "cls-stove": "sys-cooking",
  "cls-pot": "sys-cooking",
  "cls-filter": "sys-water",
  "cls-nav": "sys-navigation",
  "cls-med": "sys-medical"
};
const classToFeatures = {
  "cls-shell": ["waterproof", "hood"],
  "cls-insul": ["insulation"],
  "cls-tent": ["rainfly", "stakes"],
  "cls-pad": ["r_value"],
  "cls-bag": ["temp_rating"],
  "cls-stove": ["fuel_type"],
  "cls-pot": ["volume"],
  "cls-filter": ["flow_rate"],
  "cls-nav": ["offline_maps"],
  "cls-med": ["trauma_supplies"]
};
const gearItems = [];
for (let i = 1; i <= 60; i += 1) {
  const cls = classCycle[(i - 1) % classCycle.length];
  const mode = cls === "cls-pot" || cls === "cls-med" ? "non_packable" : "portable_volume_based";
  const features = classToFeatures[cls];
  gearItems.push({
    id: `gear-${String(i).padStart(2, "0")}`,
    slug: `gear-${String(i).padStart(2, "0")}`,
    name: `Field Gear ${i}`,
    gear_class_id: cls,
    price_usd: 59 + i * 4,
    weight_g: 170 + i * 18,
    packed_volume_l: mode === "non_packable" ? null : Number((1 + i * 0.1).toFixed(2)),
    packability_mode: mode,
    insulation_type: cls === "cls-insul" ? (i % 2 === 0 ? "down" : "synthetic") : null,
    fill_weight_g: cls === "cls-insul" ? 110 : null,
    fill_power: cls === "cls-insul" && i % 2 === 0 ? 800 : null,
    waterproof_mmv: cls === "cls-shell" ? 20000 : null,
    seam_sealed: cls === "cls-shell" ? true : null,
    breathability_gm2: cls === "cls-shell" ? 12000 : null,
    features_present: features,
    purchase_url: i % 8 === 0 ? null : "https://www.rei.com/"
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
  },
  {
    id: "trip-lg-001",
    location_id: "loc-linville-gorge",
    trip_type: "alpine_weekend",
    expected_low_c: -5,
    wind_mph: 24,
    precipitation_risk: "high",
    remoteness: "remote",
    static_exposure: "high",
    precipitation_expected: true
  },
  {
    id: "trip-rrg-001",
    location_id: "loc-red-river-gorge",
    trip_type: "day_climb_car_camp",
    expected_low_c: 8,
    wind_mph: 9,
    precipitation_risk: "low",
    remoteness: "frontcountry",
    static_exposure: "low",
    precipitation_expected: false
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
  },
  {
    id: "ft-003",
    gear_item_id: "gear-14",
    test_type: "sleep_overnight",
    test_date: "2026-01-18",
    expected_low_c: -7,
    passed: true,
    notes: "Remote overnight validation in windy basin.",
    created_by: "admin-seed"
  },
  {
    id: "ft-004",
    gear_item_id: "gear-26",
    test_type: "stove_cold_start",
    test_date: "2026-02-11",
    expected_low_c: -8,
    passed: false,
    notes: "Initial canister startup slow until warmed.",
    created_by: "admin-seed"
  }
];

for (const [name, payload] of [
  ["systems.json", systems],
  ["gear_classes.json", gearClasses],
  ["locations.json", locations],
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
const reviewCount = 420;
for (let i = 0; i < reviewCount; i += 1) {
  const item = gearItems[i % gearItems.length];
  const sourceType = i % 14 === 0 ? "third_party_review" : i % 27 === 0 ? "manufacturer_spec" : "internal_admin";
  const sourceUrl = sourceType === "internal_admin" ? "" : `https://gear-source.example/review-${String(i + 1).padStart(3, "0")}`;
  const evidenceQuality = i < 320 ? "medium" : "high";
  const month = String((i % 3) + 1).padStart(2, "0");
  const day = String((i % 28) + 1).padStart(2, "0");
  const reviewDate = `2026-${month}-${day}`;
  const systemIds = classToSystem[item.gear_class_id];
  const row = [
    item.id,
    item.gear_class_id,
    locations[i % locations.length].id,
    systemIds,
    `author-${String((i % 24) + 1).padStart(2, "0")}`,
    reviewDate,
    sourceType,
    sourceUrl,
    String(((i + 2) % 5) + 1),
    "Cold damp conditions with steady wind and overnight exposure details for fit and moisture handling.",
    String(((i + 1) % 5) + 1),
    String(((i + 3) % 5) + 1),
    String(((i + 4) % 5) + 1),
    String(20 + (i % 10)),
    String(5 + (i % 30)),
    String(i % 4 === 0 ? 1 : 0),
    String(i % 3 === 0 ? 1 : 0),
    "good_weatherproofing",
    "higher_weight",
    i % 9 === 0 ? "alpine_weekend" : "weekend_backpacking",
    "1",
    evidenceQuality
  ];
  rows.push(row.join(","));
}

fs.writeFileSync(path.join(reviewDir, "review_intel.csv"), `${rows.join("\n")}\n`);
console.log("[seed:generate] PASS");
