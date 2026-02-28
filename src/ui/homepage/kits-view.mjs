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
