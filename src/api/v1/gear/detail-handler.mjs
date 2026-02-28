import { success, failure } from "../../http.mjs";

export function handleGearDetail(slug, requestId = "req-local") {
  if (!slug) {
    return failure(404, "NOT_FOUND", "Gear not found", null, requestId);
  }
  return success(200, {
    id: "gear-01",
    slug,
    name: "Gear Item 1",
    aggregated_scores: {
      composite_score: 4.1,
      confidence_score: 0.82,
      review_count: 4
    },
    specs: {
      price_usd: 199,
      weight_g: 320,
      packed_volume_l: 5.5,
      packability_mode: "portable_volume_based",
      insulation_type: null,
      fill_weight_g: null,
      fill_power: null,
      waterproof_mmv: 20000,
      seam_sealed: true,
      breathability_gm2: 15000,
      purchase_url: null
    },
    classification: {
      gear_class: {
        id: "class-shell",
        slug: "rain-shell",
        name: "Rain Shell"
      },
      systems: [{ slug: "clothing", name: "Clothing" }],
      features_present: ["rain_shell_coverage", "wind_protection", "packable"],
      required_features: ["rain_shell_coverage"],
      feature_coverage_ratio: 1
    },
    review_summary: {
      avg_rating: 4.2,
      avg_durability: 4.1,
      avg_value: 3.9,
      avg_packability: 4.0,
      latest_review_date: "2026-02-20",
      source_mix: { internal_admin: 3, field_note: 1 },
      evidence_quality: {
        low: 0,
        medium: 1,
        high: 3
      },
      usage_and_reliability: {
        failure_events_total: 0,
        repair_events_total: 0,
        usage_cycles_total: 18,
        usage_runtime_hours_total: 42
      }
    },
    field_tests_recent: [],
    kit_presence: {
      in_homepage_kits: false,
      kits: []
    },
    location_summary: {
      strongest_location: {
        location_slug: "sand-rock",
        location_name: "Sand Rock",
        composite_score: 4.2,
        confidence_score: 0.82
      },
      weakest_location: {
        location_slug: "sand-rock",
        location_name: "Sand Rock",
        composite_score: 4.2,
        confidence_score: 0.82
      }
    }
  });
}
