import { evaluateTripPolicy } from "../../src/policy/capability/engine.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const base = {
  trip_profile: {
    trip_type: "weekend_backpacking",
    expected_low_c: 2,
    wind_mph: 8,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true
  },
  selected_gear_by_system: { clothing: ["gear-01"] },
  selected_item_factors: {
    "gear-01": { suitability_score: 0.86, top_factors: ["rain_shell", "fit", "durability"], redundancy_warnings: [] }
  },
  policy_inputs: {
    pad_rvalue: 2,
    bag_r_equivalent: 1,
    fuel_available: 50,
    fuel_required: 100,
    canister_only_stove: true,
    has_backup_stove_non_canister: false,
    has_stove_cold_test: false,
    has_l6_shell: false,
    has_l7_static_insulation: false,
    has_navigation_n3: false,
    has_medical_policy: false,
    field_test_recency_days: 180
  },
  field_tests: []
};

const failed = evaluateTripPolicy(base);
const expectedFailures = [
  "sleep_combined_r_below_threshold",
  "fuel_insufficient",
  "no_rain_protection",
  "no_static_insulation",
  "no_medical_policy"
];
for (const failure of expectedFailures) {
  assert(failed.hard_rule_failures.includes(failure), `expected hard-rule failure: ${failure}`);
}

const passing = evaluateTripPolicy({
  ...base,
  trip_profile: {
    ...base.trip_profile,
    expected_low_c: 6,
    precipitation_risk: "low",
    static_exposure: "low"
  },
  policy_inputs: {
    ...base.policy_inputs,
    pad_rvalue: 2,
    bag_r_equivalent: 2,
    fuel_available: 140,
    fuel_required: 100,
    canister_only_stove: false,
    has_l6_shell: true,
    has_l7_static_insulation: true,
    has_navigation_n3: true,
    has_medical_policy: true
  }
});
assert(passing.hard_rule_failures.length === 0, "expected no hard-rule failures in passing case");
assert(passing.approved === true, "expected passing case approved=true");

console.log("[test:capability-rules] PASS");
