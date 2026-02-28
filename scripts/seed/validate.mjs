import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const reviewFile = path.join(root, "data/seed/review_intel/review_intel.csv");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(entitiesDir, file), "utf8"));
}

const requiredFiles = [
  "systems.json",
  "gear_classes.json",
  "locations.json",
  "gear_items.json",
  "trip_profiles.json",
  "capability_policies.json",
  "field_test_logs.json"
];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(entitiesDir, file))) {
    throw new Error(`missing seed file: ${file}`);
  }
}

if (!fs.existsSync(reviewFile)) {
  throw new Error("missing review CSV file");
}

const systems = readJson("systems.json");
const gearClasses = readJson("gear_classes.json");
const locations = readJson("locations.json");
const gearItems = readJson("gear_items.json");
const fieldTests = readJson("field_test_logs.json");
const policies = readJson("capability_policies.json");

if (systems.length < 3) throw new Error("seed validation failed: System >= 3 required");
if (gearClasses.length < 6) throw new Error("seed validation failed: GearClass >= 6 required");
if (locations.length < 1) throw new Error("seed validation failed: Location >= 1 required");
if (gearItems.length < 25) throw new Error("seed validation failed: GearItem >= 25 required");
if (fieldTests.length < 1) throw new Error("seed validation failed: at least one field test required");
if (policies.length < 1) throw new Error("seed validation failed: at least one capability policy required");

const csv = fs.readFileSync(reviewFile, "utf8").trim().split("\n");
if (csv.length < 2) throw new Error("seed validation failed: review CSV has no rows");
const headers = csv[0].split(",");
const requiredHeaders = ["gear_item_id", "location_id", "review_date", "author_id", "source_type", "evidence_quality"];
for (const header of requiredHeaders) {
  if (!headers.includes(header)) throw new Error(`seed validation failed: missing CSV header ${header}`);
}

console.log("[seed:validate] PASS");
