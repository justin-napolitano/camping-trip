function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function computeTsi(tripProfile) {
  const tempComponent = clamp((10 - tripProfile.expected_low_c) / 20, 0, 1);
  const windComponent = clamp((tripProfile.wind_mph || 0) / 40, 0, 1);
  const precipComponent = tripProfile.precipitation_risk === "high" || tripProfile.precipitation_risk === "wintry"
    ? 1.0
    : tripProfile.precipitation_risk === "medium"
      ? 0.6
      : 0.2;
  const remoteComponent = tripProfile.remoteness === "remote"
    ? 1.0
    : tripProfile.remoteness === "semi_remote"
      ? 0.5
      : 0.2;
  const staticComponent = tripProfile.static_exposure === "high"
    ? 1.0
    : tripProfile.static_exposure === "medium"
      ? 0.6
      : 0.2;

  const tsi = 0.30 * tempComponent + 0.20 * windComponent + 0.20 * precipComponent + 0.15 * remoteComponent + 0.15 * staticComponent;

  const tsiBand = tsi >= 0.7 ? "severe weekend/alpine" : tsi >= 0.5 ? "high" : tsi >= 0.3 ? "moderate" : "low";

  return {
    tsi: Number(tsi.toFixed(4)),
    tsi_band: tsiBand,
    components: { tempComponent, windComponent, precipComponent, remoteComponent, staticComponent }
  };
}

export function requiredMinLevelsForBand(tsiBand) {
  const map = {
    "low": { shelter: "S2", sleep: "SL2", cooking: "C2", water: "W2", navigation: "N2", medical: "M1" },
    "moderate": { shelter: "S3", sleep: "SL3", cooking: "C3", water: "W3", navigation: "N2", medical: "M2" },
    "high": { shelter: "S4", sleep: "SL4", cooking: "C4", water: "W3", navigation: "N3", medical: "M2" },
    "severe weekend/alpine": { shelter: "S5", sleep: "SL5", cooking: "C5", water: "W4", navigation: "N3", medical: "M3" }
  };
  return map[tsiBand];
}

function requiredCombinedR(expectedLowC) {
  if (expectedLowC >= 10) return 2.5;
  if (expectedLowC >= 0) return 3.5;
  if (expectedLowC >= -6) return 4.5;
  return 6.0;
}

function hasRecentFieldTest(fieldTests, nowIso, recencyDays) {
  if (!Array.isArray(fieldTests) || fieldTests.length === 0) {
    return false;
  }
  const now = new Date(nowIso);
  const maxAgeMs = recencyDays * 24 * 60 * 60 * 1000;

  return fieldTests.some((test) => {
    if (!test || !test.test_date || !test.test_type) {
      return false;
    }
    if (test.test_type !== "sleep_overnight" && test.test_type !== "stove_cold_start") {
      return false;
    }
    const age = now.getTime() - new Date(test.test_date).getTime();
    return age >= 0 && age <= maxAgeMs;
  });
}

export function evaluateTripPolicy({
  trip_profile,
  selected_gear_by_system,
  selected_item_factors,
  policy_inputs,
  field_tests,
  now = new Date().toISOString()
}) {
  const tsiResult = computeTsi(trip_profile);
  const hardRuleFailures = [];

  const combinedR = Number((policy_inputs.pad_rvalue || 0) + (policy_inputs.bag_r_equivalent || 0));
  const combinedRRequired = requiredCombinedR(trip_profile.expected_low_c);
  if (combinedR < combinedRRequired) {
    hardRuleFailures.push("sleep_combined_r_below_threshold");
  }

  if ((policy_inputs.fuel_available || 0) < (policy_inputs.fuel_required || 0) * 1.3) {
    hardRuleFailures.push("fuel_insufficient");
  }

  if (trip_profile.expected_low_c <= 0 && policy_inputs.canister_only_stove && !(policy_inputs.has_backup_stove_non_canister || policy_inputs.has_stove_cold_test)) {
    hardRuleFailures.push("canister_unreliable_in_cold");
  }

  if (trip_profile.precipitation_risk !== "low" && !policy_inputs.has_l6_shell) {
    hardRuleFailures.push("no_rain_protection");
  }

  if (trip_profile.expected_low_c < 5 && ["medium", "high"].includes(trip_profile.static_exposure) && !policy_inputs.has_l7_static_insulation) {
    hardRuleFailures.push("no_static_insulation");
  }

  if (trip_profile.remoteness === "remote" && !policy_inputs.has_navigation_n3) {
    hardRuleFailures.push("no_navigation_redundancy");
  }

  if (!policy_inputs.has_medical_policy) {
    hardRuleFailures.push("no_medical_policy");
  }

  const requiresFieldTest = trip_profile.expected_low_c < -6 || trip_profile.remoteness === "remote";
  if (requiresFieldTest && !hasRecentFieldTest(field_tests, now, policy_inputs.field_test_recency_days || 180)) {
    hardRuleFailures.push("missing_recent_field_test");
  }

  const explainability = Object.entries(selected_item_factors || {}).map(([gearItemId, factors]) => ({
    gear_item_id: gearItemId,
    suitability_score: factors.suitability_score,
    top_factors: factors.top_factors.slice(0, 3),
    triggered_rules: hardRuleFailures,
    redundancy_warnings: factors.redundancy_warnings || []
  }));

  return {
    approved: hardRuleFailures.length === 0,
    tsi: tsiResult.tsi,
    tsi_band: tsiResult.tsi_band,
    required_min_levels: requiredMinLevelsForBand(tsiResult.tsi_band),
    hard_rule_failures: hardRuleFailures,
    selected_items_explainability: explainability,
    selected_gear_by_system
  };
}
