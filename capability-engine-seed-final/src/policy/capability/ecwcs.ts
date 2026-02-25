// ecwcs.ts - clothing compute helper
export function compute_clothing_levels(item:any): number[] {
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
