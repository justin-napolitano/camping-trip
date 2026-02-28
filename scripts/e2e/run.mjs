import { GET as getHomepageKits } from "../../app/api/v1/homepage/kits/route.js";
import { hasPurchaseUrl } from "../../src/ui/homepage/kits-view.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function parseGrep(argv) {
  const grepIndex = argv.indexOf("--grep");
  if (grepIndex === -1 || grepIndex + 1 >= argv.length) {
    return "";
  }
  return argv[grepIndex + 1].toLowerCase();
}

async function runHomepageKitsE2E() {
  const response = await getHomepageKits();
  assert(response.status === 200, "homepage kits route should return 200");
  const body = await response.json();
  assert(Array.isArray(body.kits) && body.kits.length > 0, "homepage kits route should return non-empty kits array");

  const items = body.kits.flatMap((kit) => kit.items ?? []);
  assert(items.length > 0, "homepage kits route should include at least one item");
  assert(items.some((item) => hasPurchaseUrl(item)), "homepage view should support outbound purchase link rendering");
  assert(items.some((item) => !hasPurchaseUrl(item)), "homepage view should support missing purchase link rendering");

  console.log("[test:e2e] PASS: homepage kits");
}

const grep = parseGrep(process.argv.slice(2));
if (grep && grep.includes("homepage kits")) {
  await runHomepageKitsE2E();
} else if (!grep) {
  await runHomepageKitsE2E();
} else {
  console.log(`[test:e2e] SKIP: no matching suite for grep "${grep}"`);
}
