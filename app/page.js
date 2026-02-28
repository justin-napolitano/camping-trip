"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasPurchaseUrl } from "../src/ui/homepage/kits-view.mjs";

export default function HomePage() {
  const [kits, setKits] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadKits() {
      try {
        const response = await fetch("/api/v1/homepage/kits", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const payload = await response.json();
        if (!active) {
          return;
        }
        setKits(Array.isArray(payload.kits) ? payload.kits : []);
        setStatus("ready");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }

    loadKits();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Weekend Systems</p>
        <h1>Best-Fit Kits With Explainable Decisions</h1>
        <p className="hero-copy">
          Start from tested bundles, inspect suitability factors, and verify hard-rule outcomes before committing to a kit.
        </p>
      </section>

      {status === "loading" && <p className="state-note">Loading kits...</p>}
      {status === "error" && <p className="state-note error">Could not load kits: {error}</p>}

      {status === "ready" && (
        <section className="kits-grid" aria-label="Homepage kits">
          <div className="explore-row">
            <Link href="/gear" className="explore-link">
              Explore All Gear
            </Link>
          </div>
          {kits.map((kit) => (
            <article key={kit.kit_id} className="kit-card">
              <header className="kit-header">
                <h2>{kit.name}</h2>
                <span className="chip">{kit.items.length} items</span>
              </header>
              <div className="item-stack">
                {kit.items.map((item) => (
                  <div key={item.gear_item_id} className="item-row">
                    <div className="item-main">
                      <p className="item-name">{item.name}</p>
                      <p className="item-meta">
                        {item.system} · suitability {item.suitability_score}
                      </p>
                      <p className="item-factors">Top factors: {item.top_factors.join(", ")}</p>
                      <p className={item.hard_rule_summary.passed ? "hard-pass" : "hard-fail"}>
                        Hard rules: {item.hard_rule_summary.passed ? "pass" : `fail (${item.hard_rule_summary.failures.join(", ")})`}
                      </p>
                    </div>
                    <div className="item-cta">
                      <Link href={`/gear/${encodeURIComponent(item.gear_item_id)}`} className="detail-link">
                        View Details
                      </Link>
                      {hasPurchaseUrl(item) ? (
                        <a href={item.purchase_url} target="_blank" rel="noreferrer" className="buy-link">
                          Buy
                        </a>
                      ) : (
                        <span className="no-link">No outbound link</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
