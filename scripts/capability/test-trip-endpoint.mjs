import { handleTripsEvaluate } from "../../src/api/v1/trips/evaluate/handler.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const invalid = handleTripsEvaluate({ trip_profile: {}, selected_gear_by_system: [] }, {}, "req-invalid");
assert(invalid.status === 422, "expected 422 for invalid request");
assert(invalid.body.error_code === "VALIDATION_FAILED", "expected VALIDATION_FAILED error");
assert(invalid.body.request_id === "req-invalid", "expected propagated request id");

const valid = handleTripsEvaluate(
  {
    trip_profile: {
      trip_type: "weekend_backpacking",
      expected_low_c: 6,
      wind_mph: 8,
      precipitation_risk: "low",
      remoteness: "frontcountry",
      static_exposure: "low",
      precipitation_expected: false
    },
    selected_gear_by_system: {
      clothing: ["gear-01"],
      sleep: ["gear-03"]
    }
  },
  {
    policy_inputs: {
      pad_rvalue: 2,
      bag_r_equivalent: 2,
      fuel_available: 130,
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
    selected_item_factors: {
      "gear-01": {
        suitability_score: 0.87,
        top_factors: ["weather_protection", "weight", "durability"],
        redundancy_warnings: []
      }
    }
  },
  "req-valid"
);

assert(valid.status === 200, "expected 200 for valid request");
assert(typeof valid.body.tsi === "number", "expected tsi numeric");
assert(Array.isArray(valid.body.hard_rule_failures), "expected hard_rule_failures array");
assert(valid.body.approved === true, "expected approval for passing scenario");

console.log("[test:trip-endpoint] PASS");
