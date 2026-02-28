"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { buildAffiliateResolveHref, hasPurchaseUrl } from "../../../src/ui/homepage/kits-view.mjs";

export default function GearDetailPage({ params }) {
  const slug = use(params)?.slug;
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    let active = true;

    async function load() {
      setStatus("loading");
      setError("");

      try {
        const [detailRes, locationsRes] = await Promise.all([
          fetch(`/api/v1/gear/${encodeURIComponent(slug)}`, { cache: "no-store" }),
          fetch(`/api/v1/gear/${encodeURIComponent(slug)}/locations`, { cache: "no-store" })
        ]);

        const detailJson = await detailRes.json();
        const locationsJson = await locationsRes.json();

        if (!detailRes.ok) {
          throw new Error(detailJson?.message || `Detail request failed (${detailRes.status})`);
        }

        if (!active) {
          return;
        }

        setDetail(detailJson);
        setLocations(Array.isArray(locationsJson?.locations) ? locationsJson.locations : []);
        setStatus("ready");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }

    if (slug) {
      load();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Gear Detail</p>
        <h1>{detail?.name || slug}</h1>
        <p className="hero-copy">Inspect aggregate confidence and location-specific performance for this item.</p>
      </section>

      <p className="result-links">
        <Link href="/gear" className="detail-link">
          Back To Explorer
        </Link>
      </p>

      {status === "loading" && <p className="state-note">Loading detail…</p>}
      {status === "error" && <p className="state-note error">Could not load detail: {error}</p>}

      {status === "ready" && detail && (
        <>
          <section className="kit-card">
            <h2>Aggregate Scores</h2>
            <p className="item-meta">Composite {detail.aggregated_scores?.composite_score}</p>
            <p className="item-meta">Confidence {detail.aggregated_scores?.confidence_score}</p>
            <p className="item-meta">Review count {detail.aggregated_scores?.review_count}</p>
          </section>

          <section className="kit-card">
            <h2>Specifications</h2>
            <div className="item-stack">
              <p className="item-meta">Price ${detail.specs?.price_usd}</p>
              <p className="item-meta">Weight {detail.specs?.weight_g}g</p>
              <p className="item-meta">Packed volume {detail.specs?.packed_volume_l ?? "n/a"}L</p>
              <p className="item-meta">Packability mode {detail.specs?.packability_mode}</p>
              <p className="item-meta">Insulation type {detail.specs?.insulation_type || "n/a"}</p>
              <p className="item-meta">Fill weight {detail.specs?.fill_weight_g ?? "n/a"}g</p>
              <p className="item-meta">Fill power {detail.specs?.fill_power ?? "n/a"}</p>
              <p className="item-meta">Waterproof {detail.specs?.waterproof_mmv ?? "n/a"} mm</p>
              <p className="item-meta">Seam sealed {String(detail.specs?.seam_sealed)}</p>
              <p className="item-meta">Breathability {detail.specs?.breathability_gm2 ?? "n/a"} gm2</p>
              {hasPurchaseUrl({ purchase_url: detail.specs?.purchase_url }) ? (
                <p className="item-meta">
                  <a
                    href={buildAffiliateResolveHref(detail.specs.purchase_url, {
                      placement: "gear_detail",
                      gear_item_id: detail.slug
                    })}
                    target="_blank"
                    rel="noreferrer"
                    className="buy-link"
                  >
                    Buy
                  </a>
                </p>
              ) : (
                <p className="item-meta">Purchase link n/a</p>
              )}
            </div>
          </section>

          <section className="kit-card">
            <h2>Classification</h2>
            <p className="item-meta">
              Class {detail.classification?.gear_class?.name} ({detail.classification?.gear_class?.slug})
            </p>
            <p className="item-meta">
              Systems {(detail.classification?.systems || []).map((item) => item.slug).join(", ") || "n/a"}
            </p>
            <p className="item-meta">
              Features present {(detail.classification?.features_present || []).join(", ") || "n/a"}
            </p>
            <p className="item-meta">
              Required features {(detail.classification?.required_features || []).join(", ") || "n/a"}
            </p>
            <p className="item-meta">
              Coverage ratio {detail.classification?.feature_coverage_ratio}
            </p>
          </section>

          <section className="kit-card">
            <h2>Review Summary</h2>
            <p className="item-meta">Avg rating {detail.review_summary?.avg_rating}</p>
            <p className="item-meta">Avg durability {detail.review_summary?.avg_durability}</p>
            <p className="item-meta">Avg value {detail.review_summary?.avg_value}</p>
            <p className="item-meta">Avg packability {detail.review_summary?.avg_packability}</p>
            <p className="item-meta">Latest review {detail.review_summary?.latest_review_date || "n/a"}</p>
            <p className="item-meta">
              Source mix {Object.entries(detail.review_summary?.source_mix || {}).map(([key, count]) => `${key}:${count}`).join(", ") || "n/a"}
            </p>
            <p className="item-meta">
              Evidence quality low:{detail.review_summary?.evidence_quality?.low} medium:{detail.review_summary?.evidence_quality?.medium} high:{detail.review_summary?.evidence_quality?.high}
            </p>
            <p className="item-meta">
              Failures {detail.review_summary?.usage_and_reliability?.failure_events_total} · Repairs {detail.review_summary?.usage_and_reliability?.repair_events_total}
            </p>
            <p className="item-meta">
              Usage cycles {detail.review_summary?.usage_and_reliability?.usage_cycles_total} · Runtime hours {detail.review_summary?.usage_and_reliability?.usage_runtime_hours_total}
            </p>
          </section>

          <section className="kit-card">
            <h2>Field Tests (Recent)</h2>
            <div className="item-stack">
              {(detail.field_tests_recent || []).map((test) => (
                <div key={test.id} className="item-row">
                  <div>
                    <p className="item-name">{test.test_type}</p>
                    <p className="item-meta">{test.test_date} · expected low {test.expected_low_c}C</p>
                  </div>
                  <div>
                    <p className={test.passed ? "hard-pass" : "hard-fail"}>{test.passed ? "pass" : "fail"}</p>
                    <p className="item-meta">{test.notes}</p>
                  </div>
                </div>
              ))}
              {(detail.field_tests_recent || []).length === 0 && <p className="state-note">No field tests recorded.</p>}
            </div>
          </section>

          <section className="kit-card">
            <h2>Kit Presence</h2>
            <p className="item-meta">In homepage kits: {detail.kit_presence?.in_homepage_kits ? "yes" : "no"}</p>
            <div className="item-stack">
              {(detail.kit_presence?.kits || []).map((kit) => (
                <p key={`${kit.kit_id}-${kit.system}`} className="item-meta">
                  {kit.kit_name} ({kit.kit_id}) · {kit.system} · suitability {kit.suitability_score}
                </p>
              ))}
              {(detail.kit_presence?.kits || []).length === 0 && <p className="state-note">No kit memberships.</p>}
            </div>
          </section>

          <section className="kit-card">
            <h2>Location Summary</h2>
            <p className="item-meta">
              Strongest: {detail.location_summary?.strongest_location ? `${detail.location_summary.strongest_location.location_name} (${detail.location_summary.strongest_location.composite_score}/${detail.location_summary.strongest_location.confidence_score})` : "n/a"}
            </p>
            <p className="item-meta">
              Weakest: {detail.location_summary?.weakest_location ? `${detail.location_summary.weakest_location.location_name} (${detail.location_summary.weakest_location.composite_score}/${detail.location_summary.weakest_location.confidence_score})` : "n/a"}
            </p>
          </section>

          <section className="kit-card" aria-label="Location performance">
            <h2>Location Performance</h2>
            <div className="item-stack">
              {locations.map((loc) => (
                <div key={loc.location_slug} className="item-row">
                  <div>
                    <p className="item-name">{loc.location_name}</p>
                    <p className="item-meta">{loc.location_slug}</p>
                  </div>
                  <div>
                    <p className="item-meta">Composite {loc.composite_score}</p>
                    <p className="item-meta">Confidence {loc.confidence_score}</p>
                  </div>
                </div>
              ))}
              {locations.length === 0 && <p className="state-note">No location performance data yet.</p>}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
