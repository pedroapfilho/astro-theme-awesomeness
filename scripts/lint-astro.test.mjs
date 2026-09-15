import assert from "node:assert/strict";
import { test } from "node:test";

import { ESLint } from "eslint";

import config from "../eslint.astro.config.mjs";

await test("enforces all six design-system rules inside Astro templates", async () => {
  const eslint = new ESLint({ overrideConfig: config, overrideConfigFile: true });
  const [result] = await eslint.lintText(
    `---
import { Button } from "astro-awesomeness/components";
const color = Astro.props.color;
---
<Button class={\`bg-\${color}\`} />
<Button class="p-4 bg-pink-500 p-[13px] invalid-design-class" style={{ padding: 1 }} />
`,
    { filePath: "apps/demo/src/lint-probe.astro" },
  );
  const found = new Set(result.messages.map(({ ruleId }) => ruleId));
  for (const name of Object.keys(config[0].rules).filter((ruleName) =>
    ruleName.startsWith("shadcn/"),
  )) {
    assert.ok(found.has(name), `${name} did not inspect the template`);
  }
});

await test("rejects Astro string styles, style blocks, and unchecked class lists", async () => {
  const eslint = new ESLint({ overrideConfig: config, overrideConfigFile: true });
  for (const source of [
    '<div style="color: red" />',
    "<style>div { color: red; }</style>",
    '<div class:list={["p-4"]} />',
  ]) {
    const [result] = await eslint.lintText(source, { filePath: "apps/demo/src/lint-probe.astro" });
    assert.ok(result.errorCount > 0, source);
  }
});
