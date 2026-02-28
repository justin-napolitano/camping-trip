import { computeTsi, evaluateTripPolicy, requiredMinLevelsForBand } from "../../src/policy/capability/engine.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const tripProfile = {
  trip_type: "alpine_weekend",
  expected_low_c: -8,
  wind_mph: 26,
  precipitation_risk: "wintry",
  remoteness: "remote",
  static_exposure: "high",
  precipitation_expected: true
};

const tsi = computeTsi(tripProfile);
assert(tsi.tsi_band === "severe weekend/alpine", "expected severe weekend/alpine tsi band");

const minLevels = requiredMinLevelsForBand(tsi.tsi_band);
assert(minLevels.shelter === "S5", "expected S5 shelter minimum");
assert(minLevels.sleep === "SL5", "expected SL5 sleep minimum");

const evalRes = evaluateTripPolicy({
  trip_profile: tripProfile,
  selected_gear_by_system: { shelter: ["gear-01"], sleep: ["gear-02"] },
  selected_item_factors: {
    "gear-01": { suitability_score: 0.8, top_factors: ["wind", "snow", "confidence"], redundancy_warnings: [] },
    "gear-02": { suitability_score: 0.84, top_factors: ["insulation", "r_value", "field_test"], redundancy_warnings: [] }
  },
  policy_inputs: {
    pad_rvalue: 3,
    bag_r_equivalent: 2,
    fuel_available: 200,
    fuel_required: 100,
    canister_only_stove: false,
    has_backup_stove_non_canister: true,
    has_stove_cold_test: true,
    has_l6_shell: true,
    has_l7_static_insulation: true,
    has_navigation_n3: true,
    has_medical_policy: true,
    field_test_recency_days: 180
  },
  field_tests: [
    { gear_item_id: "gear-02", test_type: "sleep_overnight", test_date: "2026-02-10", passed: true }
  ],
  now: "2026-02-28T00:00:00Z"
});

assert(evalRes.hard_rule_failures.includes("sleep_combined_r_below_threshold"), "expected severe cold to fail sleep threshold for configured inputs");
assert(evalRes.hard_rule_failures.includes("missing_recent_field_test") === false, "expected recent field test requirement satisfied");

const failedTestRes = evaluateTripPolicy({
  trip_profile: tripProfile,
  selected_gear_by_system: { shelter: ["gear-01"], sleep: ["gear-02"] },
  selected_item_factors: {
    "gear-01": { suitability_score: 0.8, top_factors: ["wind", "snow", "confidence"], redundancy_warnings: [] },
    "gear-02": { suitability_score: 0.84, top_factors: ["insulation", "r_value", "field_test"], redundancy_warnings: [] }
  },
  policy_inputs: {
    pad_rvalue: 3,
    bag_r_equivalent: 2,
    fuel_available: 200,
    fuel_required: 100,
    canister_only_stove: false,
    has_backup_stove_non_canister: true,
    has_stove_cold_test: true,
    has_l6_shell: true,
    has_l7_static_insulation: true,
    has_navigation_n3: true,
    has_medical_policy: true,
    field_test_recency_days: 180
  },
  field_tests: [
    { gear_item_id: "gear-02", test_type: "sleep_overnight", test_date: "2026-02-10", passed: false }
  ],
  now: "2026-02-28T00:00:00Z"
});
assert(failedTestRes.hard_rule_failures.includes("missing_recent_field_test"), "expected failed field test to not satisfy requirement");

const staleTestRes = evaluateTripPolicy({
  trip_profile: tripProfile,
  selected_gear_by_system: { shelter: ["gear-01"], sleep: ["gear-02"] },
  selected_item_factors: {
    "gear-01": { suitability_score: 0.8, top_factors: ["wind", "snow", "confidence"], redundancy_warnings: [] },
    "gear-02": { suitability_score: 0.84, top_factors: ["insulation", "r_value", "field_test"], redundancy_warnings: [] }
  },
  policy_inputs: {
    pad_rvalue: 3,
    bag_r_equivalent: 2,
    fuel_available: 200,
    fuel_required: 100,
    canister_only_stove: false,
    has_backup_stove_non_canister: true,
    has_stove_cold_test: true,
    has_l6_shell: true,
    has_l7_static_insulation: true,
    has_navigation_n3: true,
    has_medical_policy: true,
    field_test_recency_days: 180
  },
  field_tests: [
    { gear_item_id: "gear-02", test_type: "sleep_overnight", test_date: "2025-01-01", passed: true }
  ],
  now: "2026-02-28T00:00:00Z"
});
assert(staleTestRes.hard_rule_failures.includes("missing_recent_field_test"), "expected stale field test to not satisfy requirement");

const notSelectedGearTestRes = evaluateTripPolicy({
  trip_profile: tripProfile,
  selected_gear_by_system: { shelter: ["gear-01"], sleep: ["gear-02"] },
  selected_item_factors: {
    "gear-01": { suitability_score: 0.8, top_factors: ["wind", "snow", "confidence"], redundancy_warnings: [] },
    "gear-02": { suitability_score: 0.84, top_factors: ["insulation", "r_value", "field_test"], redundancy_warnings: [] }
  },
  policy_inputs: {
    pad_rvalue: 3,
    bag_r_equivalent: 2,
    fuel_available: 200,
    fuel_required: 100,
    canister_only_stove: false,
    has_backup_stove_non_canister: true,
    has_stove_cold_test: true,
    has_l6_shell: true,
    has_l7_static_insulation: true,
    has_navigation_n3: true,
    has_medical_policy: true,
    field_test_recency_days: 180
  },
  field_tests: [
    { gear_item_id: "gear-99", test_type: "sleep_overnight", test_date: "2026-02-10", passed: true }
  ],
  now: "2026-02-28T00:00:00Z"
});
assert(notSelectedGearTestRes.hard_rule_failures.includes("missing_recent_field_test"), "expected non-selected gear field test to not satisfy requirement");

console.log("[test:trip-evaluation] PASS");
