export function hasPurchaseUrl(item) {
  if (typeof item?.purchase_url !== "string") {
    return false;
  }

  const value = item.purchase_url.trim();
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return (parsed.protocol === "http:" || parsed.protocol === "https:") && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

export function buildAffiliateResolveHref(purchaseUrl, context = {}) {
  if (!hasPurchaseUrl({ purchase_url: purchaseUrl })) {
    return "";
  }

  const params = new URLSearchParams();
  params.set("url", String(purchaseUrl).trim());

  const placement = typeof context?.placement === "string" ? context.placement.trim() : "";
  if (placement) {
    params.set("placement", placement);
  }

  const gearItemId = typeof context?.gear_item_id === "string" ? context.gear_item_id.trim() : "";
  if (gearItemId) {
    params.set("gear_item_id", gearItemId);
  }

  const kitId = typeof context?.kit_id === "string" ? context.kit_id.trim() : "";
  if (kitId) {
    params.set("kit_id", kitId);
  }

  return `/api/v1/affiliate/resolve?${params.toString()}`;
}
