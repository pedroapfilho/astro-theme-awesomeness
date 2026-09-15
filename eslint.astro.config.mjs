import { plugin as shadcn } from "@shadcn/lint";
import tsParser from "@typescript-eslint/parser";
import * as astroParser from "astro-eslint-parser";

import config from "./oxlint.config.ts";

export default [
  {
    files: ["**/*.astro"],
    languageOptions: { parser: astroParser, parserOptions: { parser: tsParser } },
    plugins: {
      astro: {
        rules: {
          "verifiable-attributes": {
            create: (context) => ({
              JSXAttribute: (node) => {
                if (node.name.name === "style" && node.value?.type === "Literal") {
                  context.report({ messageId: "style", node });
                }
                if (
                  node.name.type === "JSXNamespacedName" &&
                  node.name.namespace.name === "class" &&
                  node.name.name.name === "list"
                ) {
                  context.report({ messageId: "classes", node });
                }
              },
            }),
            meta: {
              messages: {
                classes: "Use class={cn(...)} with complete class strings.",
                style: "Move inline CSS into the owning stylesheet.",
              },
              schema: [],
            },
          },
        },
      },
      shadcn,
    },
    rules: {
      ...Object.fromEntries(
        Object.entries(config.rules).filter(([name]) => name.startsWith("shadcn/")),
      ),
      "astro/verifiable-attributes": "error",
    },
    settings: config.settings ?? {},
  },
];
