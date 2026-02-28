import { handleHomepageKits } from "../../src/api/v1/homepage/kits/handler.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const res = handleHomepageKits();
assert(res.status === 200, "homepage kits handler should return 200");
assert(Array.isArray(res.body?.kits), "homepage kits payload must include kits array");
assert(res.body.kits.length > 0, "homepage kits must not be empty");

let withPurchaseUrl = 0;
let withoutPurchaseUrl = 0;

for (const kit of res.body.kits) {
  assert(Array.isArray(kit.items), "each kit must include items array");
  for (const item of kit.items) {
    assert(typeof item.suitability_score === "number", "each item must include suitability_score");
    assert(Array.isArray(item.top_factors) && item.top_factors.length === 3, "each item must include top 3 factors");
    assert(typeof item.hard_rule_summary?.passed === "boolean", "hard_rule_summary.passed must be boolean");
    assert(Array.isArray(item.hard_rule_summary?.failures), "hard_rule_summary.failures must be array");

    if (typeof item.purchase_url === "string" && item.purchase_url.length > 0) {
      withPurchaseUrl += 1;
    } else {
      withoutPurchaseUrl += 1;
    }
  }
}

assert(withPurchaseUrl > 0, "dataset should include at least one item with purchase_url");
assert(withoutPurchaseUrl > 0, "dataset should include at least one item without purchase_url");

console.log("[test:homepage-kits] PASS");
