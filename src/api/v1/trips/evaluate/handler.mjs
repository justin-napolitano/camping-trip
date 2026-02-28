import { validateTripsEvaluateRequest } from "../../../../contracts/index.mjs";
import { evaluateTripPolicy } from "../../../../policy/capability/engine.mjs";

function buildError(status, errorCode, message, details, requestId) {
  return {
    status,
    body: {
      error_code: errorCode,
      message,
      details,
      request_id: requestId
    }
  };
}

function defaultEvaluationContext() {
  return {
    policy_inputs: {
      pad_rvalue: 0,
      bag_r_equivalent: 0,
      fuel_available: 0,
      fuel_required: 0,
      canister_only_stove: false,
      has_backup_stove_non_canister: false,
      has_stove_cold_test: false,
      has_l6_shell: false,
      has_l7_static_insulation: false,
      has_navigation_n3: false,
      has_medical_policy: false,
      field_test_recency_days: 180
    },
    field_tests: [],
    selected_item_factors: {}
  };
}

export function handleTripsEvaluate(body, context = {}, requestId = "req-local") {
  const validation = validateTripsEvaluateRequest(body);
  if (!validation.ok) {
    return buildError(422, "VALIDATION_FAILED", "Request body failed schema validation", validation.errors, requestId);
  }

  const mergedContext = {
    ...defaultEvaluationContext(),
    ...context,
    policy_inputs: {
      ...defaultEvaluationContext().policy_inputs,
      ...(context.policy_inputs || {})
    }
  };

  const result = evaluateTripPolicy({
    trip_profile: body.trip_profile,
    selected_gear_by_system: body.selected_gear_by_system,
    selected_item_factors: mergedContext.selected_item_factors,
    policy_inputs: mergedContext.policy_inputs,
    field_tests: mergedContext.field_tests,
    now: mergedContext.now
  });

  return {
    status: 200,
    body: result
  };
}
