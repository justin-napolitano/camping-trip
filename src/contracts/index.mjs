const SOURCE_TYPES = [
  "internal_admin",
  "field_note",
  "third_party_review",
  "manufacturer_spec"
];

const TRIP_TYPES = [
  "weekend_backpacking",
  "day_climb_car_camp",
  "alpine_weekend"
];

const PRECIPITATION_RISK = ["low", "medium", "high", "wintry"];
const REMOTENESS = ["frontcountry", "semi_remote", "remote"];
const STATIC_EXPOSURE = ["low", "medium", "high"];

function ensureObject(value, fieldName) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return `${fieldName} must be an object`;
  }
  return null;
}

export function validateGearListQuery(query) {
  const allowed = new Set(["q", "gear_class", "system", "location", "sort", "order", "page", "limit"]);
  const keys = Object.keys(query ?? {});
  const unknown = keys.filter((k) => !allowed.has(k));
  if (unknown.length > 0) {
    return { ok: false, errors: [`unknown query params: ${unknown.join(",")}`] };
  }

  const hasPrimary = ["q", "gear_class", "system", "location"].some((k) => {
    const value = query?.[k];
    return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value.length > 0;
  });

  if (!hasPrimary) {
    return { ok: false, errors: ["at least one of q, gear_class, system, location is required"] };
  }

  return { ok: true, errors: [] };
}

export function validateTripsEvaluateRequest(body) {
  const errors = [];
  const bodyError = ensureObject(body, "body");
  if (bodyError) {
    return { ok: false, errors: [bodyError] };
  }

  const tripProfileError = ensureObject(body.trip_profile, "trip_profile");
  if (tripProfileError) {
    errors.push(tripProfileError);
  } else {
    const t = body.trip_profile;
    if (!TRIP_TYPES.includes(t.trip_type)) {
      errors.push("trip_profile.trip_type is invalid");
    }
    if (!PRECIPITATION_RISK.includes(t.precipitation_risk)) {
      errors.push("trip_profile.precipitation_risk is invalid");
    }
    if (!REMOTENESS.includes(t.remoteness)) {
      errors.push("trip_profile.remoteness is invalid");
    }
    if (!STATIC_EXPOSURE.includes(t.static_exposure)) {
      errors.push("trip_profile.static_exposure is invalid");
    }
    if (typeof t.expected_low_c !== "number") {
      errors.push("trip_profile.expected_low_c must be a number");
    }
    if (typeof t.wind_mph !== "number") {
      errors.push("trip_profile.wind_mph must be a number");
    }
    if (typeof t.precipitation_expected !== "boolean") {
      errors.push("trip_profile.precipitation_expected must be a boolean");
    }
  }

  const selectedError = ensureObject(body.selected_gear_by_system, "selected_gear_by_system");
  if (selectedError) {
    errors.push(selectedError);
  }

  return { ok: errors.length === 0, errors };
}

export function validateReviewIntelCreate(body) {
  const errors = [];
  const bodyError = ensureObject(body, "body");
  if (bodyError) {
    return { ok: false, errors: [bodyError] };
  }

  if (!SOURCE_TYPES.includes(body.source_type)) {
    errors.push("source_type is invalid");
  }

  const sourceTypeNeedsUrl = body.source_type === "third_party_review" || body.source_type === "manufacturer_spec";
  if (sourceTypeNeedsUrl && !(typeof body.source_url === "string" && body.source_url.trim().length > 0)) {
    errors.push("source_url is required for third_party_review or manufacturer_spec");
  }

  return { ok: errors.length === 0, errors };
}

export function validateMediaUploadUrlRequest(body) {
  const errors = [];
  const bodyError = ensureObject(body, "body");
  if (bodyError) {
    return { ok: false, errors: [bodyError] };
  }

  const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowed.has(body.mime_type)) {
    errors.push("mime_type is invalid");
  }
  if (!Number.isInteger(body.size_bytes) || body.size_bytes < 1 || body.size_bytes > 10485760) {
    errors.push("size_bytes must be an integer between 1 and 10485760");
  }
  if (typeof body.filename !== "string" || body.filename.trim().length === 0) {
    errors.push("filename is required");
  }

  return { ok: errors.length === 0, errors };
}

export function validateMediaCompleteRequest(body) {
  const errors = [];
  const bodyError = ensureObject(body, "body");
  if (bodyError) {
    return { ok: false, errors: [bodyError] };
  }

  if (typeof body.media_id !== "string" || body.media_id.trim().length === 0) {
    errors.push("media_id is required");
  }
  if (typeof body.storage_key !== "string" || body.storage_key.trim().length === 0) {
    errors.push("storage_key is required");
  }

  return { ok: errors.length === 0, errors };
}
