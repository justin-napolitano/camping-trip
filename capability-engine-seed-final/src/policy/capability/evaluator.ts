// evaluator.ts - deterministic wrapper around json-rules-engine
// Note: this is a skeleton that depends on 'json-rules-engine' npm package.
// The engine evaluates AST-style rules; rules here are policy-as-data.
// The evaluateTrip function is pure given same bundle and inputs.
import { Engine } from 'json-rules-engine';

type Trip = any;
type GearItem = any;
type TestLog = any;
type RuleBundleMeta = any;
type AcceptanceResult = any;

function computeTSI(trip: Trip) {
  const temp_component = Math.max(0, Math.min(1, (10 - trip.expected_low_c) / 20));
  const wind_component = Math.max(0, Math.min(1, trip.wind_mph / 40));
  const precip_map: any = { 'snow':1.0, 'heavy':1.0, 'moderate':0.6, 'mixed':1.0, 'light':0.2, 'none':0.2 };
  const precip_component = precip_map[trip.precipitation] ?? 0.2;
  const remote_map: any = { 'remote':1.0, 'semi_remote':0.5, 'near':0.2 };
  const remote_component = remote_map[trip.remoteness] ?? 0.2;
  const static_map: any = { 'high':1.0, 'medium':0.6, 'low':0.2 };
  const static_component = static_map[trip.static_exposure] ?? 0.2;
  const tsi = 0.30*temp_component + 0.20*wind_component + 0.20*precip_component + 0.15*remote_component + 0.15*static_component;
  let band = 'low';
  if (tsi >= 0.7) band = 'severe';
  else if (tsi >= 0.5) band = 'high';
  else if (tsi >= 0.3) band = 'moderate';
  return { tsi, band, components: { temp_component, wind_component, precip_component, remote_component, static_component } };
}

function compute_clothing_levels(item: GearItem) {
  const levels: number[] = [];
  if (item.insulation_type === 'none' && item.sub_category && (item.sub_category.includes('base') || item.sub_category.includes('top') || item.sub_category.includes('bottom'))) {
    levels.push(1);
  }
  if (item.insulation_type === 'fleece' && item.sub_category && item.sub_category.includes('grid')) {
    levels.push(2);
  }
  if (['fleece','wool'].includes(item.insulation_type) && ['pullover','jacket','vest'].some(s=> (item.sub_category||'').includes(s))) {
    levels.push(3);
  }
  if ((!item.waterproof_mmv || item.waterproof_mmv === 0) && item.sub_category && (item.sub_category.includes('wind') || item.sub_category.includes('houdini'))) {
    levels.push(4);
  }
  if (item.waterproof_mmv && item.waterproof_mmv <= 9999 && (item.breathability_gm2 && item.breathability_gm2 >= 8000 || (item.sub_category||'').includes('softshell'))) {
    levels.push(5);
  }
  if (item.waterproof_mmv && item.waterproof_mmv >= 10000 && item.seam_sealed) {
    levels.push(6);
  }
  if ((item.insulation_type === 'synthetic' && item.fill_weight_g && item.fill_weight_g >= 100) ||
      (item.insulation_type === 'down' && item.fill_weight_g && item.fill_weight_g >= 300 && item.fill_power && item.fill_power >= 650)) {
    levels.push(7);
  }
  return Array.from(new Set(levels)).sort((a,b)=>a-b);
}

export async function evaluateTrip({trip, gear, tests, bundleMeta}:{trip:any,gear:any[],tests:any[],bundleMeta:any}): Promise<any> {
  const tsiRes = computeTSI(trip);
  const engine = new Engine();
  // NOTE: production should map policy rules into json-rules-engine format deterministically.
  // For demo, we add a placeholder no-op rule.
  engine.addRule({
    conditions: { any: [{ fact: 'dummy', operator: 'equal', value: true }] },
    event: { type: 'noop' }
  });
  const facts = { trip, gear, tests, tsi: tsiRes };
  const start = Date.now();
  const res = await engine.run(facts);
  const duration = Date.now() - start;
  const acceptance = {
    trip_id: trip.trip_id,
    timestamp: new Date().toISOString(),
    approved: true,
    tsi: tsiRes.tsi,
    tsi_band: tsiRes.band,
    hard_rule_triggers: [],
    warnings: [],
    selected_items: gear.map(g=>({ item_id: g.id, computed_levels: compute_clothing_levels(g) })),
    suitability_score: 0.9,
    top_3_factors: ['sleep_R','waterproof','fuel_margin'],
    redundancy_warnings: [],
    required_min_levels: {}
  };
  return acceptance;
}
