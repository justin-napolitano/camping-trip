"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (typeof value === "string" && value.trim().length > 0) {
      search.set(key, value.trim());
    }
  });
  if (!search.get("q") && !search.get("gear_class") && !search.get("system") && !search.get("location")) {
    search.set("q", "Field");
  }
  if (!search.get("page")) {
    search.set("page", "1");
  }
  if (!search.get("limit")) {
    search.set("limit", "20");
  }
  return search;
}

export default function GearExplorerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initial = useMemo(
    () => ({
      q: searchParams.get("q") || "Field",
      gear_class: searchParams.get("gear_class") || "",
      system: searchParams.get("system") || "",
      location: searchParams.get("location") || "",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20"
    }),
    [searchParams]
  );

  const [filters, setFilters] = useState(initial);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [payload, setPayload] = useState({ items: [], total: 0, page: 1, limit: 20 });

  useEffect(() => {
    setFilters(initial);
  }, [initial]);

  useEffect(() => {
    let active = true;

    async function load() {
      setStatus("loading");
      setError("");
      const query = buildQuery(filters);

      try {
        const response = await fetch(`/api/v1/gear?${query.toString()}`, { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.message || `Request failed (${response.status})`);
        }
        if (!active) {
          return;
        }
        setPayload({
          items: Array.isArray(data.items) ? data.items : [],
          total: Number(data.total || 0),
          page: Number(data.page || 1),
          limit: Number(data.limit || 20)
        });
        setStatus("ready");
      } catch (err) {
        if (!active) {
          return;
        }
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [filters]);

  function apply(next) {
    const updated = { ...filters, ...next };
    if (next.q !== undefined || next.gear_class !== undefined || next.system !== undefined || next.location !== undefined) {
      updated.page = "1";
    }
    setFilters(updated);
    const query = buildQuery(updated);
    router.replace(`/gear?${query.toString()}`);
  }

  return (
    <main className="page-shell">
      <section className="hero">
        <p className="eyebrow">Gear Explorer</p>
        <h1>Browse Gear Intelligence</h1>
        <p className="hero-copy">Search by name, class, system, or location and inspect score confidence before opening details.</p>
      </section>

      <section className="filter-bar" aria-label="Gear search controls">
        <input
          value={filters.q}
          onChange={(event) => apply({ q: event.target.value })}
          placeholder="Search gear"
          aria-label="Search gear"
        />
        <input
          value={filters.gear_class}
          onChange={(event) => apply({ gear_class: event.target.value })}
          placeholder="Class slug"
          aria-label="Class slug"
        />
        <input
          value={filters.system}
          onChange={(event) => apply({ system: event.target.value })}
          placeholder="System slug"
          aria-label="System slug"
        />
        <input
          value={filters.location}
          onChange={(event) => apply({ location: event.target.value })}
          placeholder="Location slug"
          aria-label="Location slug"
        />
      </section>

      {status === "loading" && <p className="state-note">Loading gear…</p>}
      {status === "error" && <p className="state-note error">Could not load gear: {error}</p>}

      {status === "ready" && (
        <section className="results-stack" aria-label="Gear results">
          <p className="result-count">{payload.total} results</p>
          {payload.items.map((item) => (
            <article key={item.id} className="result-card">
              <header className="result-header">
                <h2>{item.name}</h2>
                <span className="chip">{item.slug}</span>
              </header>
              <p className="item-meta">Composite {item.composite_score} · Confidence {item.confidence_score}</p>
              <p className="item-factors">Factors: {item.explainability?.factors?.join(", ") || "n/a"}</p>
              <div className="result-links">
                <Link href={`/gear/${encodeURIComponent(item.slug)}`} className="detail-link">
                  Open Detail
                </Link>
              </div>
            </article>
          ))}
          {payload.items.length === 0 && <p className="state-note">No gear matched this query.</p>}
        </section>
      )}
    </main>
  );
}
