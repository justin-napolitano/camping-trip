import { validateGearListQuery, validateTripsEvaluateRequest, validateReviewIntelCreate } from "../../src/contracts/index.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const validQuery = validateGearListQuery({ q: "shell", page: "1", limit: "20" });
assert(validQuery.ok, "expected valid gear query to pass");

const invalidQuery = validateGearListQuery({ page: "1" });
assert(!invalidQuery.ok, "expected missing primary filter query to fail");

const queryWithUnknown = validateGearListQuery({ q: "pad", unknown: "x" });
assert(!queryWithUnknown.ok, "expected unknown query param to fail");

const validTripEval = validateTripsEvaluateRequest({
  trip_profile: {
    trip_type: "weekend_backpacking",
    expected_low_c: 2,
    wind_mph: 12,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true
  },
  selected_gear_by_system: {
    sleep: ["gear-1"],
    cooking: ["gear-2"]
  }
});
assert(validTripEval.ok, "expected valid trip evaluation request to pass");

const invalidTripEval = validateTripsEvaluateRequest({
  trip_profile: {
    trip_type: "expedition",
    expected_low_c: "cold",
    wind_mph: 12,
    precipitation_risk: "heavy",
    remoteness: "near",
    static_exposure: "high",
    precipitation_expected: true
  },
  selected_gear_by_system: []
});
assert(!invalidTripEval.ok, "expected invalid trip evaluation request to fail");

const tripEvalUnknownBodyField = validateTripsEvaluateRequest({
  trip_profile: {
    trip_type: "weekend_backpacking",
    expected_low_c: 2,
    wind_mph: 12,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true
  },
  selected_gear_by_system: { sleep: ["gear-1"] },
  unexpected: "x"
});
assert(!tripEvalUnknownBodyField.ok, "expected unknown body fields to fail");

const tripEvalUnknownTripProfileField = validateTripsEvaluateRequest({
  trip_profile: {
    trip_type: "weekend_backpacking",
    expected_low_c: 2,
    wind_mph: 12,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true,
    unknown_prop: true
  },
  selected_gear_by_system: { sleep: ["gear-1"] }
});
assert(!tripEvalUnknownTripProfileField.ok, "expected unknown trip_profile fields to fail");

const tripEvalInvalidSelectedIds = validateTripsEvaluateRequest({
  trip_profile: {
    trip_type: "weekend_backpacking",
    expected_low_c: 2,
    wind_mph: 12,
    precipitation_risk: "medium",
    remoteness: "semi_remote",
    static_exposure: "medium",
    precipitation_expected: true
  },
  selected_gear_by_system: { sleep: ["gear-1", "", 12], cooking: "gear-2" }
});
assert(!tripEvalInvalidSelectedIds.ok, "expected selected_gear_by_system item/type validation to fail");

const validReview = validateReviewIntelCreate({
  source_type: "internal_admin",
  source_url: null
});
assert(validReview.ok, "expected internal_admin review to pass without source_url");

const invalidReview = validateReviewIntelCreate({
  source_type: "third_party_review",
  source_url: ""
});
assert(!invalidReview.ok, "expected third_party_review review to fail without source_url");

console.log("[test:contract] PASS");
