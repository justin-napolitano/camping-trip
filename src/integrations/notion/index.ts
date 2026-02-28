import type { IntegrationAdapter } from "../adapter";

export class NotionAdapter implements IntegrationAdapter {
  readonly provider = "notion";

  isEnabled(): boolean {
    return process.env.NOTION_ENABLED === "true" && Boolean(process.env.NOTION_TOKEN);
  }
}
