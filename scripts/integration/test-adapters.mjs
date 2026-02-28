import { NotionAdapter } from "../../src/integrations/notion/index.mjs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const originalEnabled = process.env.NOTION_ENABLED;
const originalToken = process.env.NOTION_TOKEN;

process.env.NOTION_ENABLED = "false";
process.env.NOTION_TOKEN = "abc";
assert(new NotionAdapter().isEnabled() === false, "notion should be disabled when NOTION_ENABLED=false");

process.env.NOTION_ENABLED = "true";
delete process.env.NOTION_TOKEN;
assert(new NotionAdapter().isEnabled() === false, "notion should be disabled when token missing");

process.env.NOTION_ENABLED = "true";
process.env.NOTION_TOKEN = "abc";
assert(new NotionAdapter().isEnabled() === true, "notion should be enabled only with flag+token");

if (originalEnabled === undefined) {
  delete process.env.NOTION_ENABLED;
} else {
  process.env.NOTION_ENABLED = originalEnabled;
}

if (originalToken === undefined) {
  delete process.env.NOTION_TOKEN;
} else {
  process.env.NOTION_TOKEN = originalToken;
}

console.log("[test:integration-adapters] PASS");
