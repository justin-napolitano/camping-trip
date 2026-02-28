export function hasPurchaseUrl(item) {
  return typeof item?.purchase_url === "string" && item.purchase_url.trim().length > 0;
}
