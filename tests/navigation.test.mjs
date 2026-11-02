import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdir, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "esbuild";
import { JSDOM } from "jsdom";

// Exercise the real React components in a DOM, without substituting the router.
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "http://localhost/", pretendToBeVisual: true },
);
for (const key of [
  "window",
  "document",
  "HTMLElement",
  "Element",
  "SVGElement",
  "Node",
  "MouseEvent",
  "KeyboardEvent",
  "Event",
  "getComputedStyle",
]) {
  globalThis[key] =
    key === "getComputedStyle"
      ? dom.window.getComputedStyle.bind(dom.window)
      : dom.window[key];
}
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(
  dom.window,
);
globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(
  dom.window,
);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let scrollCalls = 0;
window.scrollTo = () => {
  scrollCalls++;
};
const media = new Map();
window.matchMedia = (query) => {
  if (!media.has(query)) {
    const listeners = new Set();
    media.set(query, {
      matches: false,
      media: query,
      addListener() {},
      removeListener() {},
      addEventListener(type, listener) {
        if (type === "change") listeners.add(listener);
      },
      removeEventListener(type, listener) {
        if (type === "change") listeners.delete(listener);
      },
      update(matches) {
        this.matches = matches;
        for (const listener of listeners) listener({ matches });
      },
    });
  }
  return media.get(query);
};

const result = await build({
  entryPoints: ["src/App.jsx"],
  bundle: true,
  write: false,
  format: "esm",
  platform: "node",
  packages: "external",
  jsx: "automatic",
  loader: { ".css": "empty" },
});
await mkdir(".sites-runtime", { recursive: true });
const bundle = resolve(".sites-runtime/test-app.mjs");
await writeFile(bundle, result.outputFiles[0].contents);
const { default: App } = await import(pathToFileURL(bundle).href);
const { createElement, act } = await import("react");
const { createRoot } = await import("react-dom/client");
const root = createRoot(document.getElementById("root"));
async function click(element) {
  assert.ok(element, "Expected an interactive element");
  await act(async () => {
    element.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }),
    );
  });
}
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 450));
  });
}
async function key(key, options = {}) {
  await act(async () => {
    document.activeElement.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
        cancelable: true,
        ...options,
      }),
    );
  });
}

test("routing, order links, mobile focus lifecycle, sticky state and admin separation", async () => {
  const errors = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  console.error = (...args) => {
    errors.push(args.join(" "));
  };
  console.warn = (...args) => {
    errors.push(args.join(" "));
  };
  try {
    await act(async () => {
      root.render(createElement(App));
    });
    await settle();
    assert.match(document.querySelector("h1").textContent, /Mustahkamlik/);
    assert.equal(
      document
        .querySelector('.desktop-navigation [aria-current="page"]')
        .getAttribute("href"),
      "/",
    );
    const order = document.querySelector(".navbar-actions .gold-button");
    assert.equal(order.href, "https://t.me/aura_200707");
    assert.equal(order.target, "_blank");
    assert.match(order.rel, /noopener/);

    const routes = [
      ["/products", "Makoningizga mos tanlov."],
      ["/discounts", "Yaxshi tanlovga yaxshi imkoniyat."],
      ["/about", "Har bir detalning o‘z o‘rni bor."],
      ["/contact", "Suhbatdan boshlaymiz."],
    ];
    const originalNavbar = document.querySelector(".navbar");
    for (const [path, heading] of routes) {
      await click(
        document.querySelector(`.desktop-navigation a[href="${path}"]`),
      );
      await settle();
      assert.equal(window.location.pathname, path);
      assert.equal(document.querySelector("h1").textContent, heading);
      assert.equal(
        document
          .querySelector('.desktop-navigation [aria-current="page"]')
          .getAttribute("href"),
        path,
      );
      assert.equal(
        document.querySelector(".navbar"),
        originalNavbar,
        "Shared navbar must stay mounted",
      );
    }
    assert.ok(scrollCalls >= 5);
    assert.match(document.title, /Bog‘lanish — Namuna Tosh Markazi/);

    Object.defineProperty(window, "scrollY", { value: 50, configurable: true });
    await act(async () => {
      window.dispatchEvent(new Event("scroll"));
    });
    assert.ok(document.querySelector(".navbar-scrolled"));

    const trigger = document.querySelector(".menu-toggle");
    await click(trigger);
    await settle();
    const dialog = document.querySelector('[role="dialog"]');
    assert.ok(dialog);
    assert.equal(trigger.getAttribute("aria-expanded"), "true");
    assert.equal(document.body.style.overflow, "hidden");
    assert.equal(document.getElementById("site-shell").inert, true);
    const closeButton = dialog.querySelector("button");
    assert.equal(document.activeElement, closeButton);
    const last = [...dialog.querySelectorAll("a[href], button")].at(-1);
    await key("Tab", { shiftKey: true });
    assert.equal(document.activeElement, last, "Shift+Tab wraps to last link");
    await key("Tab");
    assert.equal(
      document.activeElement,
      closeButton,
      "Tab wraps to close button",
    );
    await key("Escape");
    await settle();
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement, trigger);
    assert.equal(document.body.style.overflow, "");
    assert.equal(document.getElementById("site-shell").inert, false);

    await click(trigger);
    await settle();
    await click(document.querySelector('[role="dialog"] a[href="/products"]'));
    await settle();
    assert.equal(window.location.pathname, "/products");
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.body.style.overflow, "");
    assert.equal(trigger.getAttribute("aria-expanded"), "false");
    assert.equal(document.querySelector('a[href="/admin"]'), null);

    await click(trigger);
    await settle();
    await act(async () => {
      window.matchMedia("(min-width: 1100px)").update(true);
    });
    await settle();
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.body.style.overflow, "");
    assert.equal(
      document.activeElement,
      document.querySelector(".navbar .brand"),
    );
    await act(async () => {
      window.matchMedia("(min-width: 1100px)").update(false);
    });

    await click(trigger);
    await settle();
    await click(document.querySelector('[aria-label="Menyuni yopish"]'));
    await settle();
    assert.equal(document.activeElement, trigger);

    await act(async () => {
      window.history.pushState({}, "", "/admin");
      window.dispatchEvent(new Event("popstate"));
    });
    await settle();
    assert.equal(document.querySelector("h1").textContent, "Admin panel");
    assert.equal(document.querySelector(".navbar"), null);
    assert.match(
      document.querySelector(".admin-notice").textContent,
      /himoyalanmagan/,
    );
    await act(async () => {
      window.history.pushState({}, "", "/missing");
      window.dispatchEvent(new Event("popstate"));
    });
    await settle();
    assert.match(
      document.querySelector("h1").textContent,
      /Bu yerda sahifa yo‘q/,
    );
    assert.equal(errors.length, 0, errors.join("\n"));
  } finally {
    await act(async () => root.unmount());
    console.error = originalError;
    console.warn = originalWarn;
    dom.window.close();
  }
});
