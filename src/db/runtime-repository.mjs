import { queryRows, sqlLiteral, sqlUuid } from "./pg-shell.mjs";

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => typeof item === "string" && item.trim().length > 0);
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
  }
  return [];
}

function parseTopFactors(featuresPresent) {
  const factors = Array.isArray(featuresPresent)
    ? featuresPresent.filter((item) => typeof item === "string" && item.trim().length > 0).slice(0, 3)
    : [];
  const fallback = ["confidence", "coverage", "durability"];
  while (factors.length < 3) {
    factors.push(fallback[factors.length]);
  }
  return factors;
}

export async function fetchGearListDb(query) {
  const page = Math.max(1, Number.parseInt(String(query?.page ?? "1"), 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(String(query?.limit ?? "20"), 10) || 20));
  const offset = (page - 1) * limit;

  const where = ["g.deleted_at IS NULL"];
  if (typeof query?.q === "string" && query.q.trim()) {
    where.push(`g.name ILIKE '%' || ${sqlLiteral(query.q.trim())} || '%'`);
  }
  if (typeof query?.gear_class === "string" && query.gear_class.trim()) {
    where.push(`gc.slug = ${sqlLiteral(query.gear_class.trim())}`);
  }

  const systemFilter = toArray(query?.system);
  if (systemFilter.length > 0) {
    where.push(`s.slug IN (${systemFilter.map((item) => sqlLiteral(item)).join(",")})`);
  }

  const locationFilter = toArray(query?.location);
  if (locationFilter.length > 0) {
    where.push(`l.slug IN (${locationFilter.map((item) => sqlLiteral(item)).join(",")})`);
  }

  const whereSql = where.join(" AND ");
  const sort = typeof query?.sort === "string" ? query.sort : "composite";
  const order = String(query?.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

  const sortSql = sort === "confidence"
    ? `confidence_score ${order}, composite_score DESC`
    : sort === "updated_at"
      ? `updated_at ${order}, composite_score DESC`
      : `composite_score ${order}, confidence_score DESC`;

  const rows = await queryRows(`
    SELECT
      g.id::text AS id,
      g.slug,
      g.name,
      COALESCE(AVG(ri.composite_score)::float, 3.5) AS composite_score,
      COALESCE(AVG(ri.confidence_score)::float, 0.6) AS confidence_score,
      MAX(g.updated_at) AS updated_at
    FROM gear_item g
    JOIN gear_class gc ON gc.id = g.gear_class_id
    LEFT JOIN gear_item_system gis ON gis.gear_item_id = g.id
    LEFT JOIN system s ON s.id = gis.system_id
    LEFT JOIN review_intel ri ON ri.gear_item_id = g.id AND ri.deleted_at IS NULL
    LEFT JOIN location l ON l.id = ri.location_id
    WHERE ${whereSql}
    GROUP BY g.id, g.slug, g.name
    ORDER BY ${sortSql}
    LIMIT ${limit} OFFSET ${offset};
  `);

  const totalRows = await queryRows(`
    SELECT COUNT(DISTINCT g.id)::int AS total
    FROM gear_item g
    JOIN gear_class gc ON gc.id = g.gear_class_id
    LEFT JOIN gear_item_system gis ON gis.gear_item_id = g.id
    LEFT JOIN system s ON s.id = gis.system_id
    LEFT JOIN review_intel ri ON ri.gear_item_id = g.id AND ri.deleted_at IS NULL
    LEFT JOIN location l ON l.id = ri.location_id
    WHERE ${whereSql};
  `);

  return {
    items: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      composite_score: Number(row.composite_score),
      confidence_score: Number(row.confidence_score),
      explainability: {
        factors: ["composite_score", "confidence_score", "review_count"],
        tie_break_path: ["curation_none", "composite_desc", "confidence_desc"]
      }
    })),
    page,
    limit,
    total: Number(totalRows[0]?.total || 0)
  };
}

export async function fetchGearDetailDb(slug) {
  const baseRows = await queryRows(`
    SELECT
      g.id::text AS id,
      g.slug,
      g.name,
      g.price_usd::float AS price_usd,
      g.weight_g,
      g.packed_volume_l::float AS packed_volume_l,
      g.packability_mode,
      g.insulation_type,
      g.fill_weight_g,
      g.fill_power,
      g.waterproof_mmv,
      g.seam_sealed,
      g.breathability_gm2,
      g.purchase_url,
      g.features_present,
      gc.id::text AS gear_class_id,
      gc.slug AS gear_class_slug,
      gc.name AS gear_class_name,
      gc.required_features,
      COALESCE(AVG(ri.composite_score)::float, 3.5) AS composite_score,
      COALESCE(AVG(ri.confidence_score)::float, 0.6) AS confidence_score,
      COUNT(ri.id)::int AS review_count
    FROM gear_item g
    JOIN gear_class gc ON gc.id = g.gear_class_id
    LEFT JOIN review_intel ri ON ri.gear_item_id = g.id AND ri.deleted_at IS NULL
    WHERE g.slug = ${sqlLiteral(slug)} AND g.deleted_at IS NULL
    GROUP BY g.id, g.slug, g.name, g.price_usd, g.weight_g, g.packed_volume_l, g.packability_mode,
      g.insulation_type, g.fill_weight_g, g.fill_power, g.waterproof_mmv, g.seam_sealed, g.breathability_gm2,
      g.purchase_url, g.features_present, gc.id, gc.slug, gc.name, gc.required_features
    LIMIT 1;
  `);

  const base = baseRows[0];
  if (!base) {
    return null;
  }

  const systems = await queryRows(`
    SELECT s.slug, s.name
    FROM gear_item_system gis
    JOIN system s ON s.id = gis.system_id
    WHERE gis.gear_item_id = ${sqlUuid(base.id)}
    ORDER BY s.slug ASC;
  `);

  const reviewSummaryRows = await queryRows(`
    SELECT
      COALESCE(AVG(rating)::float, 0) AS avg_rating,
      COALESCE(AVG(durability)::float, 0) AS avg_durability,
      COALESCE(AVG(value)::float, 0) AS avg_value,
      COALESCE(AVG(packability)::float, 0) AS avg_packability,
      MAX(review_date)::text AS latest_review_date,
      COALESCE(SUM(COALESCE(failure_event_count, 0))::int, 0) AS failure_events_total,
      COALESCE(SUM(COALESCE(repair_event_count, 0))::int, 0) AS repair_events_total,
      COALESCE(SUM(COALESCE(usage_cycles_observed, 0))::float, 0) AS usage_cycles_total,
      COALESCE(SUM(COALESCE(usage_runtime_hours, 0))::float, 0) AS usage_runtime_hours_total,
      COALESCE(COUNT(*) FILTER (WHERE evidence_quality_score <= 0.35)::int, 0) AS evidence_low,
      COALESCE(COUNT(*) FILTER (WHERE evidence_quality_score > 0.35 AND evidence_quality_score < 0.8)::int, 0) AS evidence_medium,
      COALESCE(COUNT(*) FILTER (WHERE evidence_quality_score >= 0.8)::int, 0) AS evidence_high
    FROM review_intel
    WHERE gear_item_id = ${sqlUuid(base.id)} AND deleted_at IS NULL;
  `);
  const summary = reviewSummaryRows[0] || {};

  const sourceMixRows = await queryRows(`
    SELECT source_type, COUNT(*)::int AS count
    FROM review_intel
    WHERE gear_item_id = ${sqlUuid(base.id)} AND deleted_at IS NULL
    GROUP BY source_type
    ORDER BY source_type ASC;
  `);
  const sourceMix = {};
  for (const row of sourceMixRows) {
    sourceMix[row.source_type] = Number(row.count);
  }

  const fieldTests = await queryRows(`
    SELECT
      id::text AS id,
      test_type,
      test_date::text AS test_date,
      expected_low_c::float AS expected_low_c,
      passed,
      notes
    FROM field_test_log
    WHERE gear_item_id = ${sqlUuid(base.id)}
    ORDER BY test_date DESC, id ASC
    LIMIT 10;
  `);

  const kits = await queryRows(`
    SELECT
      b.slug AS kit_id,
      b.name AS kit_name,
      s.slug AS system,
      i.suitability_score::float AS suitability_score
    FROM homepage_kit_item i
    JOIN homepage_kit_bundle b ON b.id = i.homepage_kit_bundle_id
    JOIN system s ON s.id = i.system_id
    WHERE i.gear_item_id = ${sqlUuid(base.id)} AND b.deleted_at IS NULL
    ORDER BY b.slug ASC;
  `);

  const locationRows = await queryRows(`
    SELECT
      l.slug AS location_slug,
      l.name AS location_name,
      COALESCE(AVG(ri.composite_score)::float, 3.5) AS composite_score,
      COALESCE(AVG(ri.confidence_score)::float, 0.6) AS confidence_score
    FROM review_intel ri
    JOIN location l ON l.id = ri.location_id
    WHERE ri.gear_item_id = ${sqlUuid(base.id)} AND ri.deleted_at IS NULL
    GROUP BY l.slug, l.name
    ORDER BY composite_score DESC, confidence_score DESC;
  `);
  const strongestLocation = locationRows[0] || null;
  const weakestLocation = locationRows.length > 0 ? locationRows[locationRows.length - 1] : null;

  const featuresPresent = Array.isArray(base.features_present) ? base.features_present : [];
  const requiredFeatures = Array.isArray(base.required_features) ? base.required_features : [];
  const covered = requiredFeatures.filter((feature) => featuresPresent.includes(feature)).length;
  const featureCoverageRatio = requiredFeatures.length > 0 ? covered / requiredFeatures.length : 1;

  return {
    id: base.id,
    slug: base.slug,
    name: base.name,
    aggregated_scores: {
      composite_score: Number(base.composite_score),
      confidence_score: Number(base.confidence_score),
      review_count: Number(base.review_count)
    },
    specs: {
      price_usd: Number(base.price_usd),
      weight_g: Number(base.weight_g),
      packed_volume_l: base.packed_volume_l === null ? null : Number(base.packed_volume_l),
      packability_mode: base.packability_mode,
      insulation_type: base.insulation_type,
      fill_weight_g: base.fill_weight_g,
      fill_power: base.fill_power,
      waterproof_mmv: base.waterproof_mmv,
      seam_sealed: base.seam_sealed,
      breathability_gm2: base.breathability_gm2,
      purchase_url: base.purchase_url
    },
    classification: {
      gear_class: {
        id: base.gear_class_id,
        slug: base.gear_class_slug,
        name: base.gear_class_name
      },
      systems: systems.map((row) => ({ slug: row.slug, name: row.name })),
      features_present: featuresPresent,
      required_features: requiredFeatures,
      feature_coverage_ratio: Number(featureCoverageRatio.toFixed(3))
    },
    review_summary: {
      avg_rating: Number(summary.avg_rating || 0),
      avg_durability: Number(summary.avg_durability || 0),
      avg_value: Number(summary.avg_value || 0),
      avg_packability: Number(summary.avg_packability || 0),
      latest_review_date: summary.latest_review_date || null,
      source_mix: sourceMix,
      evidence_quality: {
        low: Number(summary.evidence_low || 0),
        medium: Number(summary.evidence_medium || 0),
        high: Number(summary.evidence_high || 0)
      },
      usage_and_reliability: {
        failure_events_total: Number(summary.failure_events_total || 0),
        repair_events_total: Number(summary.repair_events_total || 0),
        usage_cycles_total: Number(summary.usage_cycles_total || 0),
        usage_runtime_hours_total: Number(summary.usage_runtime_hours_total || 0)
      }
    },
    field_tests_recent: fieldTests.map((row) => ({
      id: row.id,
      test_type: row.test_type,
      test_date: row.test_date,
      expected_low_c: Number(row.expected_low_c),
      passed: row.passed === true,
      notes: row.notes
    })),
    kit_presence: {
      in_homepage_kits: kits.length > 0,
      kits: kits.map((row) => ({
        kit_id: row.kit_id,
        kit_name: row.kit_name,
        system: row.system,
        suitability_score: Number(row.suitability_score)
      }))
    },
    location_summary: {
      strongest_location: strongestLocation
        ? {
            location_slug: strongestLocation.location_slug,
            location_name: strongestLocation.location_name,
            composite_score: Number(strongestLocation.composite_score),
            confidence_score: Number(strongestLocation.confidence_score)
          }
        : null,
      weakest_location: weakestLocation
        ? {
            location_slug: weakestLocation.location_slug,
            location_name: weakestLocation.location_name,
            composite_score: Number(weakestLocation.composite_score),
            confidence_score: Number(weakestLocation.confidence_score)
          }
        : null
    }
  };
}

export async function fetchGearLocationsDb(slug) {
  const rows = await queryRows(`
    SELECT
      g.slug AS gear_slug,
      l.slug AS location_slug,
      l.name AS location_name,
      COALESCE(AVG(ri.composite_score)::float, 3.5) AS composite_score,
      COALESCE(AVG(ri.confidence_score)::float, 0.6) AS confidence_score
    FROM gear_item g
    JOIN review_intel ri ON ri.gear_item_id = g.id AND ri.deleted_at IS NULL
    JOIN location l ON l.id = ri.location_id
    WHERE g.slug = ${sqlLiteral(slug)}
    GROUP BY g.slug, l.slug, l.name
    ORDER BY composite_score DESC, confidence_score DESC;
  `);

  if (rows.length === 0) {
    return null;
  }

  return {
    gear_slug: rows[0].gear_slug,
    locations: rows.map((row) => ({
      location_slug: row.location_slug,
      location_name: row.location_name,
      composite_score: Number(row.composite_score),
      confidence_score: Number(row.confidence_score)
    }))
  };
}

export async function fetchHomepageKitsDb() {
  const rows = await queryRows(`
    SELECT
      b.slug AS kit_slug,
      b.name AS kit_name,
      i.gear_item_id::text AS gear_item_id,
      g.slug AS gear_slug,
      g.name AS gear_name,
      s.slug AS system_slug,
      i.suitability_score::float AS suitability_score,
      i.top_factors,
      i.hard_rule_summary,
      i.purchase_url
    FROM homepage_kit_bundle b
    JOIN homepage_kit_item i ON i.homepage_kit_bundle_id = b.id
    JOIN gear_item g ON g.id = i.gear_item_id
    JOIN system s ON s.id = i.system_id
    WHERE b.deleted_at IS NULL
    ORDER BY b.created_at ASC, i.created_at ASC;
  `);

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.kit_slug)) {
      grouped.set(row.kit_slug, {
        kit_id: row.kit_slug,
        name: row.kit_name,
        items: []
      });
    }

    grouped.get(row.kit_slug).items.push({
      gear_item_id: row.gear_slug || row.gear_item_id,
      name: row.gear_name,
      system: row.system_slug,
      suitability_score: Number(row.suitability_score),
      top_factors: parseTopFactors(row.top_factors),
      hard_rule_summary: row.hard_rule_summary || { passed: true, failures: [] },
      purchase_url: row.purchase_url || null
    });
  }

  return { kits: Array.from(grouped.values()) };
}

export async function fetchTripEvaluationContextDb(selectedGearIds) {
  const policyRows = await queryRows(`
    SELECT
      id::text,
      field_test_recency_days,
      fuel_buffer_multiplier::float AS fuel_buffer_multiplier
    FROM capability_policy
    ORDER BY updated_at DESC, id ASC
    LIMIT 1;
  `);

  const policy = policyRows[0] || null;
  if (!policy) {
    return null;
  }

  const selectedList = (selectedGearIds || []).map((id) => sqlUuid(id)).join(",");
  const selectedRows = selectedList
    ? await queryRows(`
      SELECT
        g.id::text AS gear_item_id,
        g.features_present,
        g.insulation_type,
        g.fill_weight_g,
        g.waterproof_mmv,
        COALESCE(AVG(ri.composite_score)::float, 0.75) AS suitability_score,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.slug), NULL) AS systems
      FROM gear_item g
      LEFT JOIN review_intel ri ON ri.gear_item_id = g.id AND ri.deleted_at IS NULL
      LEFT JOIN gear_item_system gis ON gis.gear_item_id = g.id
      LEFT JOIN system s ON s.id = gis.system_id
      WHERE g.id IN (${selectedList})
      GROUP BY g.id, g.features_present, g.insulation_type, g.fill_weight_g, g.waterproof_mmv;
    `)
    : [];

  const selectedFactors = {};
  let hasL6Shell = false;
  let hasL7StaticInsulation = false;
  let hasNavigationN3 = false;
  let cookingItemCount = 0;

  for (const row of selectedRows) {
    const topFactors = parseTopFactors(row.features_present);
    selectedFactors[row.gear_item_id] = {
      suitability_score: Number(row.suitability_score || 0.75),
      top_factors: topFactors,
      redundancy_warnings: []
    };

    if (Number(row.waterproof_mmv || 0) > 0 || topFactors.includes("waterproof")) {
      hasL6Shell = true;
    }
    if (row.insulation_type || Number(row.fill_weight_g || 0) > 0) {
      hasL7StaticInsulation = true;
    }

    const systems = Array.isArray(row.systems) ? row.systems : [];
    if (systems.includes("navigation")) {
      hasNavigationN3 = true;
    }
    if (systems.includes("cooking")) {
      cookingItemCount += 1;
    }
  }

  const fieldTests = selectedList
    ? await queryRows(`
      SELECT
        id::text,
        gear_item_id::text,
        test_type,
        test_date::text,
        expected_low_c::float AS expected_low_c,
        passed,
        notes,
        created_by
      FROM field_test_log
      WHERE gear_item_id IN (${selectedList})
      ORDER BY test_date DESC, id ASC;
    `)
    : [];

  const hasStoveColdTest = fieldTests.some((row) => row.test_type === "stove_cold_start" && row.passed === true);

  return {
    policy_inputs: {
      pad_rvalue: 2,
      bag_r_equivalent: 2,
      fuel_available: 130,
      fuel_required: 100,
      canister_only_stove: cookingItemCount > 0,
      has_backup_stove_non_canister: cookingItemCount > 1,
      has_stove_cold_test: hasStoveColdTest,
      has_l6_shell: hasL6Shell,
      has_l7_static_insulation: hasL7StaticInsulation,
      has_navigation_n3: hasNavigationN3,
      has_medical_policy: true,
      field_test_recency_days: Number(policy.field_test_recency_days || 180)
    },
    field_tests: fieldTests,
    selected_item_factors: selectedFactors
  };
}
