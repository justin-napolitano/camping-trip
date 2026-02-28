import { success } from "../../http.mjs";

export function handleLocationsList() {
  return success(200, {
    items: [
      {
        id: "loc-sand-rock",
        slug: "sand-rock",
        name: "Sand Rock",
        country_code: "US",
        region_code: "AL",
        latitude: 34.2357,
        longitude: -85.7833
      }
    ]
  });
}
