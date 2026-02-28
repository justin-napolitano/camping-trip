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

function getSelectedGearIds(selectedGearBySystem) {
  return Object.values(selectedGearBySystem || {}).flatMap((ids) => Array.isArray(ids) ? ids : []);
}

function hasPolicyContext(context) {
  return Boolean(context?.policy_inputs && typeof context.policy_inputs.field_test_recency_days === "number");
}

function getExplainabilityErrors(selectedGearIds, selectedItemFactors) {
  const errors = [];
  const factorsById = selectedItemFactors || {};

  for (const gearId of selectedGearIds) {
    const factor = factorsById[gearId];
    if (!factor) {
      errors.push(`missing explainability for selected gear item: ${gearId}`);
      continue;
    }

    if (typeof factor.suitability_score !== "number") {
      errors.push(`missing suitability_score for selected gear item: ${gearId}`);
    }

    if (!Array.isArray(factor.top_factors) || factor.top_factors.length < 3) {
      errors.push(`top_factors must contain at least 3 entries for selected gear item: ${gearId}`);
      continue;
    }

    const firstThree = factor.top_factors.slice(0, 3);
    if (firstThree.some((item) => typeof item !== "string" || item.trim().length === 0)) {
      errors.push(`top_factors entries must be non-empty strings for selected gear item: ${gearId}`);
    }
  }

  return errors;
}

export function handleTripsEvaluate(body, context = {}, requestId = "req-local") {
  const validation = validateTripsEvaluateRequest(body);
  if (!validation.ok) {
    return buildError(422, "VALIDATION_ERROR", "Request body failed schema validation", validation.errors, requestId);
  }

  if (!hasPolicyContext(context)) {
    return buildError(409, "POLICY_CONTEXT_MISSING", "Required policy context is unavailable", null, requestId);
  }

  const mergedContext = {
    ...defaultEvaluationContext(),
    ...context,
    policy_inputs: {
      ...defaultEvaluationContext().policy_inputs,
      ...(context.policy_inputs || {})
    }
  };

  const selectedGearIds = getSelectedGearIds(body.selected_gear_by_system);
  const explainabilityErrors = getExplainabilityErrors(selectedGearIds, mergedContext.selected_item_factors);
  if (explainabilityErrors.length > 0) {
    return buildError(
      422,
      "EXPLAINABILITY_INCOMPLETE",
      "Explainability payload is incomplete for selected gear",
      explainabilityErrors,
      requestId
    );
  }

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
