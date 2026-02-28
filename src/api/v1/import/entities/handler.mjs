import { success } from "../../../http.mjs";

export function handleImportEntities() {
  return success(202, {
    job_id: "imp-entities-1",
    status: "accepted",
    upserts: {
      gear_items: 0,
      gear_classes: 0,
      locations: 0,
      systems: 0
    },
    errors: []
  });
}
