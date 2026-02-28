import { success } from "../../http.mjs";

export function handleSystemsList() {
  return success(200, {
    items: [
      { id: "sys-clothing", slug: "clothing", name: "Clothing", deprecated: false },
      { id: "sys-sleep", slug: "sleep", name: "Sleep", deprecated: false }
    ]
  });
}
