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
            name: "Stormline Rain Shell",
            system: "clothing",
            suitability_score: 0.91,
            top_factors: ["rain_shell_coverage", "wind_protection", "confidence"],
            hard_rule_summary: { passed: true, failures: [] },
            purchase_url: "https://example.com/stormline-rain-shell"
          },
          {
            gear_item_id: "gear-02",
            name: "Insulated Static Jacket",
            system: "clothing",
            suitability_score: 0.88,
            top_factors: ["static_insulation", "packability", "confidence"],
            hard_rule_summary: { passed: true, failures: [] },
            purchase_url: null
          }
        ]
      },
      {
        kit_id: "wknd-2",
        name: "Cold-Weather Weekend Backup",
        items: [
          {
            gear_item_id: "gear-03",
            name: "Cold-Start Stove Kit",
            system: "cooking",
            suitability_score: 0.87,
            top_factors: ["cold_start_validation", "fuel_margin", "redundancy"],
            hard_rule_summary: { passed: false, failures: ["fuel_margin_below_buffer"] },
            purchase_url: "https://example.com/cold-start-stove-kit"
          }
        ]
      }
    ]
  });
}
