import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import { test } from "node:test";

const source = await readFile(
  new URL("../public/theme-init.js", import.meta.url),
  "utf8",
);
for (const scenario of [
  { name: "system dark", saved: null, systemDark: true, expected: "dark" },
  { name: "system light", saved: null, systemDark: false, expected: "light" },
  {
    name: "saved dark overrides system light",
    saved: "dark",
    systemDark: false,
    expected: "dark",
  },
  {
    name: "saved light overrides system dark",
    saved: "light",
    systemDark: true,
    expected: "light",
  },
  {
    name: "invalid storage falls back to system",
    saved: "invalid",
    systemDark: true,
    expected: "dark",
  },
  {
    name: "blocked storage still starts",
    blocked: true,
    systemDark: false,
    expected: "light",
  },
]) {
  test(`first-paint theme: ${scenario.name}`, () => {
    const root = { dataset: {} };
    let metaColor;
    runInNewContext(source, {
      localStorage: {
        getItem() {
          if (scenario.blocked) throw new Error("Storage blocked");
          return scenario.saved;
        },
      },
      matchMedia: () => ({ matches: scenario.systemDark }),
      document: {
        documentElement: root,
        querySelector: () => ({
          setAttribute: (_, value) => {
            metaColor = value;
          },
        }),
      },
    });
    assert.equal(root.dataset.theme, scenario.expected);
    assert.equal(
      metaColor,
      scenario.expected === "dark" ? "#080808" : "#F8F7F3",
    );
  });
}
