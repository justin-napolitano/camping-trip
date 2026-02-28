import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const sourceNormalizedFile = path.join(root, "data/seed/sources/normalized/normalized-source-records.json");
const reviewFile = path.join(root, "data/seed/review_intel/review_intel.csv");
const outDir = path.join(root, "artifacts/import-reports");

const systems = JSON.parse(fs.readFileSync(path.join(entitiesDir, "systems.json"), "utf8"));
const gearClasses = JSON.parse(fs.readFileSync(path.join(entitiesDir, "gear_classes.json"), "utf8"));
const locations = JSON.parse(fs.readFileSync(path.join(entitiesDir, "locations.json"), "utf8"));
const gearItems = JSON.parse(fs.readFileSync(path.join(entitiesDir, "gear_items.json"), "utf8"));
const sourceGearItemsFile = path.join(entitiesDir, "gear_items.source.json");
const sourceGearItems = fs.existsSync(sourceGearItemsFile)
  ? JSON.parse(fs.readFileSync(sourceGearItemsFile, "utf8"))
  : [];
const totalGearItems = gearItems.length + sourceGearItems.length;
const sourceNormalized = fs.existsSync(sourceNormalizedFile)
  ? JSON.parse(fs.readFileSync(sourceNormalizedFile, "utf8"))
  : [];

const lines = fs.readFileSync(reviewFile, "utf8").trim().split("\n");
const header = lines[0].split(",");
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const perGear = new Map();
let mediumOrHigh = 0;
for (let i = 1; i < lines.length; i += 1) {
  const cols = lines[i].split(",");
  const gearItemId = cols[idx.gear_item_id];
  const quality = cols[idx.evidence_quality];
  perGear.set(gearItemId, (perGear.get(gearItemId) ?? 0) + 1);
  if (quality === "medium" || quality === "high") {
    mediumOrHigh += 1;
  }
}

const reviewRows = lines.length - 1;
const evidencePct = reviewRows === 0 ? 0 : (mediumOrHigh / reviewRows) * 100;

const minPerGear = Math.min(...gearItems.map((g) => perGear.get(g.id) ?? 0));

const report = {
  generated_at: new Date().toISOString(),
  counts: {
    systems: systems.length,
    gear_classes: gearClasses.length,
    locations: locations.length,
    gear_items: totalGearItems,
    gear_items_base: gearItems.length,
    gear_items_source: sourceGearItems.length,
    review_intel: reviewRows
  },
  source_provenance: {
    normalized_rows: sourceNormalized.length,
    source_ids: Array.from(new Set(sourceNormalized.map((row) => row.source_id))).sort(),
    parser_versions: Array.from(new Set(sourceNormalized.map((row) => row.parser_version))).sort()
  },
  thresholds: {
    min_systems: 3,
    min_gear_classes: 6,
    min_locations: 1,
    min_gear_items: 25,
    min_review_intel: 100,
    min_reviews_per_gear_item: 2,
    min_medium_high_evidence_pct: 80
  },
  observed: {
    min_reviews_per_gear_item: minPerGear,
    medium_high_evidence_pct: Number(evidencePct.toFixed(2))
  },
  pass: systems.length >= 3 && gearClasses.length >= 6 && locations.length >= 1 && totalGearItems >= 25 && reviewRows >= 100 && minPerGear >= 2 && evidencePct >= 80
};

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outFile = path.join(outDir, `seed-report-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
fs.writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`);

if (!report.pass) {
  throw new Error(`[seed:report] thresholds failed; see ${outFile}`);
}

console.log(`[seed:report] PASS: ${outFile}`);
