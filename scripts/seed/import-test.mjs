import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const entitiesDir = path.join(root, "data/seed/entities");
const reviewFile = path.join(root, "data/seed/review_intel/review_intel.csv");

const gearItems = new Set(JSON.parse(fs.readFileSync(path.join(entitiesDir, "gear_items.json"), "utf8")).map((x) => x.id));
const gearClasses = new Set(JSON.parse(fs.readFileSync(path.join(entitiesDir, "gear_classes.json"), "utf8")).map((x) => x.id));
const locations = new Set(JSON.parse(fs.readFileSync(path.join(entitiesDir, "locations.json"), "utf8")).map((x) => x.id));

const lines = fs.readFileSync(reviewFile, "utf8").trim().split("\n");
const header = lines[0].split(",");
const index = Object.fromEntries(header.map((h, i) => [h, i]));

let fkViolations = 0;
for (let i = 1; i < lines.length; i += 1) {
  const cols = lines[i].split(",");
  const gearItemId = cols[index.gear_item_id];
  const gearClassId = cols[index.gear_class_id];
  const locationId = cols[index.location_id];

  if (!gearItems.has(gearItemId)) fkViolations += 1;
  if (!gearClasses.has(gearClassId)) fkViolations += 1;
  if (!locations.has(locationId)) fkViolations += 1;
}

if (fkViolations > 0) {
  throw new Error(`[seed:import:test] FK violations detected: ${fkViolations}`);
}

console.log("[seed:import:test] PASS");
