import { handleGearList } from "../../src/api/v1/gear/list-handler.mjs";
import { handleGearDetail } from "../../src/api/v1/gear/detail-handler.mjs";
import { handleGearLocations } from "../../src/api/v1/gear/locations-handler.mjs";
import { handleHomepageKits } from "../../src/api/v1/homepage/kits/handler.mjs";
import { handleLocationsList } from "../../src/api/v1/locations/list-handler.mjs";
import { handleSystemsList } from "../../src/api/v1/systems/list-handler.mjs";
import { handleTripsEvaluate } from "../../src/api/v1/trips/evaluate/handler.mjs";
import { handleReviewIntelCreate } from "../../src/api/v1/review-intel/create-handler.mjs";
import { handleImportReviewIntel } from "../../src/api/v1/import/review-intel/handler.mjs";
import { handleImportEntities } from "../../src/api/v1/import/entities/handler.mjs";
import { handleMediaUploadUrl } from "../../src/api/v1/media/upload-url/handler.mjs";
import { handleMediaComplete } from "../../src/api/v1/media/complete/handler.mjs";
import { handleAffiliateResolve } from "../../src/api/v1/affiliate/resolve-handler.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(handleGearList({ q: "shell" }).status === 200, "gear list should pass for valid query");
assert(handleGearList({ page: "1" }).status === 400, "gear list should fail when no primary query/filter is present");
assert(handleGearDetail("gear-01").status === 200, "gear detail should pass");
assert(handleGearLocations("gear-01").status === 200, "gear locations should pass");
assert(handleHomepageKits().status === 200, "homepage kits should pass");
assert(handleLocationsList().status === 200, "locations list should pass");
assert(handleSystemsList().status === 200, "systems list should pass");

const tripRes = handleTripsEvaluate(
  {
    trip_profile: {
      trip_type: "weekend_backpacking",
      expected_low_c: 6,
      wind_mph: 8,
      precipitation_risk: "low",
      remoteness: "frontcountry",
      static_exposure: "low",
      precipitation_expected: false
    },
    selected_gear_by_system: { clothing: ["gear-01"] }
  },
  {
    policy_inputs: {
      pad_rvalue: 2,
      bag_r_equivalent: 2,
      fuel_available: 130,
      fuel_required: 100,
      canister_only_stove: false,
      has_backup_stove_non_canister: true,
      has_stove_cold_test: true,
      has_l6_shell: true,
      has_l7_static_insulation: true,
      has_navigation_n3: true,
      has_medical_policy: true,
      field_test_recency_days: 180
    },
    selected_item_factors: {
      "gear-01": {
        suitability_score: 0.86,
        top_factors: ["fit", "durability", "value"],
        redundancy_warnings: []
      }
    }
  }
);
assert(tripRes.status === 200, "trip evaluate should pass for valid request");

assert(
  handleReviewIntelCreate({ source_type: "third_party_review", source_url: "" }).status === 422,
  "review-intel create should validate source_url dependency"
);
assert(handleReviewIntelCreate({ source_type: "internal_admin", source_url: null, version: 1 }).status === 201, "review-intel create should pass internal source");
assert(handleImportReviewIntel().status === 202, "import review-intel should return 202");
assert(handleImportEntities().status === 202, "import entities should return 202");
assert(handleMediaUploadUrl({ filename: "img.jpg", mime_type: "image/jpeg", size_bytes: 2048 }).status === 200, "media upload-url should pass for allowed type");
assert(handleMediaUploadUrl({ filename: "img.jpg", mime_type: "application/pdf", size_bytes: 2048 }).status === 422, "media upload-url should reject disallowed type");
assert(handleMediaComplete({ media_id: "m1", storage_key: "uploads/m1" }).status === 200, "media complete should pass");
assert(handleMediaComplete({ media_id: "", storage_key: "" }).status === 422, "media complete should validate required fields");
assert(handleAffiliateResolve({ url: "https://www.rei.com/product/1/demo" }).status === 302, "affiliate resolve should redirect for trusted urls");
assert(handleAffiliateResolve({ url: "https://example.com/unsafe" }).status === 422, "affiliate resolve should reject untrusted urls");
assert(handleAffiliateResolve({}).status === 400, "affiliate resolve should validate required query fields");

console.log("[test:endpoint-handlers] PASS");
