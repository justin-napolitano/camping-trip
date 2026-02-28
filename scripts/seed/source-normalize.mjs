import fs from "node:fs";
import path from "node:path";
import { listApprovedSourceIds } from "../../src/seed/source-policy.mjs";
import { normalizeRawSourceRecord } from "../../src/seed/sources/normalize-record.mjs";

const root = process.cwd();
const rawDir = path.join(root, "data/seed/sources/raw");
const normalizedDir = path.join(root, "data/seed/sources/normalized");
const entitiesDir = path.join(root, "data/seed/entities");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function stableSourceGearId(sourceId, dedupeKey) {
  return `src-${sourceId}-${dedupeKey.slice(0, 12)}`;
}

function loadRawBySource() {
  const bySource = [];
  for (const sourceId of listApprovedSourceIds()) {
    if (sourceId === "manual_admin_fixture") {
      continue;
    }
    const file = path.join(rawDir, `${sourceId}.json`);
    if (!fs.existsSync(file)) {
      continue;
    }
    const rows = readJson(file);
    if (!Array.isArray(rows)) {
      throw new Error(`raw source file must be array: ${file}`);
    }
    bySource.push({ sourceId, rows });
  }
  return bySource;
}

function buildClassIdMap() {
  const classes = readJson(path.join(entitiesDir, "gear_classes.json"));
  const bySlug = new Map();
  for (const row of classes) {
    bySlug.set(row.slug, row.id);
  }
  return bySlug;
}

function toCanonicalGearItem(normalized, classIdBySlug) {
  const gearClassId = classIdBySlug.get(normalized.gear_class_slug);
  if (!gearClassId) {
    throw new Error(`unknown gear class slug in normalization: ${normalized.gear_class_slug}`);
  }
  return {
    id: stableSourceGearId(normalized.source_id, normalized.source_dedupe_key),
    slug: normalized.slug,
    name: normalized.name,
    gear_class_id: gearClassId,
    price_usd: normalized.price_usd,
    weight_g: normalized.weight_g,
    packed_volume_l: normalized.packed_volume_l,
    packability_mode: normalized.packability_mode,
    insulation_type: normalized.insulation_type,
    fill_weight_g: normalized.fill_weight_g,
    fill_power: normalized.fill_power,
    waterproof_mmv: normalized.waterproof_mmv,
    seam_sealed: normalized.seam_sealed,
    breathability_gm2: normalized.breathability_gm2,
    features_present: normalized.features_present,
    purchase_url: normalized.purchase_url
  };
}

function compareNormalized(a, b) {
  if (a.source_id !== b.source_id) return a.source_id.localeCompare(b.source_id);
  if (a.source_product_id !== b.source_product_id) return a.source_product_id.localeCompare(b.source_product_id);
  return a.slug.localeCompare(b.slug);
}

function main() {
  const classIdBySlug = buildClassIdMap();
  const sourceFiles = loadRawBySource();

  const normalizedByDedupe = new Map();
  let inputCount = 0;
  for (const source of sourceFiles) {
    for (const row of source.rows) {
      inputCount += 1;
      const normalized = normalizeRawSourceRecord({ ...row, source_id: source.sourceId });
      if (!normalizedByDedupe.has(normalized.source_dedupe_key)) {
        normalizedByDedupe.set(normalized.source_dedupe_key, normalized);
      }
    }
  }

  const normalized = Array.from(normalizedByDedupe.values()).sort(compareNormalized);
  const canonicalGearItems = normalized.map((row) => toCanonicalGearItem(row, classIdBySlug));

  writeJson(path.join(normalizedDir, "normalized-source-records.json"), normalized);
  writeJson(path.join(entitiesDir, "gear_items.source.json"), canonicalGearItems);

  console.log(
    `[seed:source:normalize] PASS sources=${sourceFiles.length} input_rows=${inputCount} normalized=${normalized.length} emitted_gear_items=${canonicalGearItems.length}`
  );
}

try {
  main();
} catch (error) {
  console.error(`[seed:source:normalize] FAIL ${error.message}`);
  process.exit(1);
}
