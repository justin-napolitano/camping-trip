import { handleTripsEvaluate } from "../../../../../src/api/v1/trips/evaluate/handler.mjs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fetchTripEvaluationContextDb } from "../../../../../src/db/runtime-repository.mjs";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}

function loadSeedJson(filename) {
  const filePath = path.join(process.cwd(), "data", "seed", "entities", filename);
  return readFile(filePath, "utf8").then((raw) => JSON.parse(raw));
}

function selectPolicyRecord(records) {
  const normalized = Array.isArray(records) ? records.filter((row) => row && typeof row.id === "string") : [];
  if (normalized.length === 0) {
    return null;
  }

  const sorted = [...normalized].sort((a, b) => {
    const aTime = Date.parse(a.updated_at || "") || 0;
    const bTime = Date.parse(b.updated_at || "") || 0;
    if (aTime !== bTime) {
      return bTime - aTime;
    }
    return String(a.id).localeCompare(String(b.id));
  });
  return sorted[0];
}

function deriveSelectedItemFactors(selectedGearBySystem, gearItems) {
  const selectedGearIds = Object.values(selectedGearBySystem || {}).flatMap((ids) => Array.isArray(ids) ? ids : []);
  const gearById = new Map((Array.isArray(gearItems) ? gearItems : []).map((item) => [item.id, item]));
  const result = {};

  for (const gearId of selectedGearIds) {
    const gear = gearById.get(gearId);
    if (!gear) {
      continue;
    }

    const features = Array.isArray(gear.features_present)
      ? gear.features_present.filter((feature) => typeof feature === "string" && feature.trim().length > 0)
      : [];
    const topFactors = features.slice(0, 3);
    while (topFactors.length < 3) {
      topFactors.push(["baseline_fit", "confidence", "coverage"][topFactors.length]);
    }

    result[gearId] = {
      suitability_score: 0.75,
      top_factors: topFactors,
      redundancy_warnings: []
    };
  }

  return result;
}

async function buildEvaluationContext(body) {
  const selectedGearIds = Object.values(body?.selected_gear_by_system || {}).flatMap((ids) => Array.isArray(ids) ? ids : []);

  try {
    const dbContext = await fetchTripEvaluationContextDb(selectedGearIds);
    if (dbContext) {
      return dbContext;
    }
  } catch {
    // Fallback to seed file context for environments without DB access.
  }

  const [policies, fieldTests, gearItems] = await Promise.all([
    loadSeedJson("capability_policies.json"),
    loadSeedJson("field_test_logs.json"),
    loadSeedJson("gear_items.json")
  ]);

  const policy = selectPolicyRecord(policies);
  if (!policy) {
    return null;
  }

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
      has_medical_policy: true,
      field_test_recency_days: Number.isInteger(policy.field_test_recency_days) ? policy.field_test_recency_days : 180
    },
    selected_item_factors: deriveSelectedItemFactors(body?.selected_gear_by_system, gearItems),
    field_tests: Array.isArray(fieldTests) ? fieldTests : []
  };
}

export async function POST(request) {
  try {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    const body = await request.json();
    const context = await buildEvaluationContext(body);
    if (!context) {
      return jsonResponse(
        {
          error_code: "POLICY_CONTEXT_MISSING",
          message: "Required policy context is unavailable",
          details: null,
          request_id: requestId
        },
        409
      );
    }
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
