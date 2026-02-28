# Notion Adapter Disabled-Provider Evidence

- Command: `npm run integration:check`
  - Result: PASS
- Command: `npm run test:integration-adapters`
  - Result: PASS

Validated behavior:
- `NOTION_ENABLED=false` => adapter disabled.
- `NOTION_ENABLED=true` with missing `NOTION_TOKEN` => adapter disabled.
- `NOTION_ENABLED=true` with `NOTION_TOKEN` present => adapter enabled.
