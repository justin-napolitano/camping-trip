import { handleTripsEvaluate } from "../../../../../src/api/v1/trips/evaluate/handler.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}

async function buildEvaluationContext() {
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
    selected_item_factors: {},
    field_tests: []
  };
}

export async function POST(request) {
  try {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    const body = await request.json();
    const context = await buildEvaluationContext();
    const result = handleTripsEvaluate(body, context, requestId);
    return jsonResponse(result.body, result.status);
  } catch (error) {
    const requestId = crypto.randomUUID();
    return jsonResponse(
      {
        error_code: "INTERNAL_ERROR",
        message: "Unexpected error",
        details: error instanceof Error ? { name: error.name } : null,
        request_id: requestId
      },
      500
    );
  }
}
