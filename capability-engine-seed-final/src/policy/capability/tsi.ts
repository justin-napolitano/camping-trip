// tsi.ts - compute Trip Severity Index and band
export function computeTSI(trip:any) {
  const temp_component = Math.max(0, Math.min(1, (10 - trip.expected_low_c) / 20));
  const wind_component = Math.max(0, Math.min(1, (trip.wind_mph||0) / 40));
  const precip_map:any = { 'snow':1.0, 'heavy':1.0, 'moderate':0.6, 'mixed':1.0, 'light':0.2, 'none':0.2 };
  const precip_component = precip_map[trip.precipitation] ?? 0.2;
  const remote_map:any = { 'remote':1.0, 'semi_remote':0.5, 'near':0.2 };
  const remote_component = remote_map[trip.remoteness] ?? 0.2;
  const static_map:any = { 'high':1.0, 'medium':0.6, 'low':0.2 };
  const static_component = static_map[trip.static_exposure] ?? 0.2;
  const tsi = 0.30*temp_component + 0.20*wind_component + 0.20*precip_component + 0.15*remote_component + 0.15*static_component;
  let band = 'low';
  if (tsi >= 0.7) band = 'severe';
  else if (tsi >= 0.5) band = 'high';
  else if (tsi >= 0.3) band = 'moderate';
  return { tsi, band, components: { temp_component, wind_component, precip_component, remote_component, static_component } };
}
