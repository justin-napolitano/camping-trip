import { BaseIntegrationAdapter } from "../adapter.mjs";

export class NotionAdapter extends BaseIntegrationAdapter {
  constructor() {
    super("notion");
  }

  isEnabled() {
    return process.env.NOTION_ENABLED === "true" && Boolean(process.env.NOTION_TOKEN);
  }
}
