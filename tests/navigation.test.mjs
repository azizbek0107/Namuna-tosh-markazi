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
// Keep animation frames real while only the carousel's five-second interval is mocked.
globalThis.requestAnimationFrame = (callback) =>
  setTimeout(() => callback(performance.now()), 16);
globalThis.cancelAnimationFrame = clearTimeout;
window.requestAnimationFrame = globalThis.requestAnimationFrame;
window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
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
  loader: { ".css": "empty", ".jpg": "dataurl", ".png": "dataurl" },
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
  for (let frame = 0; frame < 3; frame++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 160));
    });
  }
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

test("theme persistence, carousel, routing and accessible mobile navigation", async (t) => {
  t.mock.timers.enable({ apis: ["setInterval"] });
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
      document.documentElement.dataset.theme,
      "light",
      "First visit uses system preference",
    );
    await act(async () => {
      window.matchMedia("(prefers-color-scheme: dark)").update(true);
    });
    assert.equal(
      document.documentElement.dataset.theme,
      "dark",
      "System changes apply before explicit selection",
    );
    await act(async () => {
      window.matchMedia("(prefers-color-scheme: dark)").update(false);
    });
    assert.equal(document.documentElement.dataset.theme, "light");
    await click(document.querySelector(".theme-toggle"));
    assert.equal(document.documentElement.dataset.theme, "dark");
    assert.equal(window.localStorage.getItem("namuna-theme"), "dark");
    assert.match(
      document.querySelector(".theme-toggle").getAttribute("aria-label"),
      /Kunduzgi/,
    );
    await act(async () => {
      window.matchMedia("(prefers-color-scheme: dark)").update(false);
    });
    assert.equal(
      document.documentElement.dataset.theme,
      "dark",
      "Explicit choice overrides system",
    );
    await act(async () => {
      root.render(createElement(App, { key: "reload-simulation" }));
    });
    await settle();
    assert.equal(
      document.documentElement.dataset.theme,
      "dark",
      "Remount restores stored choice",
    );

    const currentSlide = () =>
      document.querySelector(".product-slide").getAttribute("aria-label");
    assert.equal(
      document.querySelector(".carousel-view").getAttribute("aria-live"),
      "off",
      "Autoplay begins active",
    );
    assert.match(currentSlide(), /^1 \/ 3/);
    assert.ok(
      document
        .querySelector(".product-image-frame img")
        .src.startsWith("data:image/jpeg"),
    );
    await act(async () => {
      t.mock.timers.tick(5000);
    });
    await settle();
    assert.equal(
      document.querySelector(".carousel-topline>span:last-child").textContent,
      "02 / 03",
      "Autoplay updates selected index",
    );
    assert.match(currentSlide(), /^2 \/ 3/, "Auto advances after five seconds");
    const carousel = document.querySelector(".product-carousel");
    await act(async () => {
      carousel.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    });
    await act(async () => {
      t.mock.timers.tick(10000);
    });
    await settle();
    assert.match(currentSlide(), /^2 \/ 3/, "Hover suspends auto advance");
    await act(async () => {
      carousel.dispatchEvent(new MouseEvent("mouseout", { bubbles: true }));
    });
    await click(carousel.querySelector('[aria-label="Keyingi mahsulot"]'));
    await settle();
    assert.match(currentSlide(), /^3 \/ 3/);
    await click(carousel.querySelector('[aria-label="Oldingi mahsulot"]'));
    await settle();
    assert.match(currentSlide(), /^2 \/ 3/);
    await act(async () => {
      carousel.focus();
    });
    await key("Home");
    await settle();
    assert.match(currentSlide(), /^1 \/ 3/);
    await key("End");
    await settle();
    assert.match(currentSlide(), /^3 \/ 3/);
    const viewport = carousel.querySelector(".carousel-view");
    const touchEvent = (type, property, x, y) => {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, property, {
        value: [{ clientX: x, clientY: y }],
      });
      viewport.dispatchEvent(event);
    };
    await act(async () => {
      touchEvent("touchstart", "touches", 200, 100);
      touchEvent("touchend", "changedTouches", 80, 105);
    });
    await settle();
    assert.match(
      currentSlide(),
      /^1 \/ 3/,
      "Horizontal swipe wraps to first slide",
    );
    await click(carousel.querySelector('[aria-label="2-slayd: Angola Black"]'));
    await settle();
    assert.match(currentSlide(), /^2 \/ 3/);
    await act(async () => {
      t.mock.timers.tick(10000);
    });
    await settle();
    assert.match(
      currentSlide(),
      /^2 \/ 3/,
      "Keyboard focus suspends auto advance",
    );
    await click(carousel.querySelector(".carousel-play"));
    await act(async () => {
      t.mock.timers.tick(5000);
    });
    await settle();
    assert.match(currentSlide(), /^3 \/ 3/, "Play explicitly resumes rotation");
    await click(carousel.querySelector(".carousel-play"));
    await act(async () => {
      t.mock.timers.tick(10000);
    });
    await settle();
    assert.match(currentSlide(), /^3 \/ 3/, "Pause stops rotation");
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
      assert.equal(document.documentElement.dataset.theme, "dark");
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
    await click(document.querySelector(".theme-toggle"));
    assert.equal(document.documentElement.dataset.theme, "light");
    assert.equal(window.localStorage.getItem("namuna-theme"), "light");
    assert.match(
      document.querySelector(".theme-toggle").getAttribute("aria-label"),
      /Tungi/,
    );

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
