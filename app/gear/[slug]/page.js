"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function GearDetailPage({ params }) {
  const slug = params?.slug;
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
