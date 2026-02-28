import { success } from "../../../http.mjs";

export function handleHomepageKits() {
  return success(200, {
    kits: [
      {
        kit_id: "wknd-1",
        name: "Weekend Backpacking Baseline",
        items: [
          {
            gear_item_id: "gear-01",
            name: "Gear Item 1",
            system: "clothing",
            suitability_score: 0.89,
            top_factors: ["weather_protection", "weight", "confidence"],
            hard_rule_summary: { passed: true, failures: [] },
            purchase_url: "https://example.com/gear-01"
          }
        ]
      }
    ]
  });
}
