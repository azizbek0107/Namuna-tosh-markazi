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
let scrollTarget;
let scrollOptions;
HTMLElement.prototype.scrollIntoView = function (options) {
  scrollTarget = this;
  scrollOptions = options;
};
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
async function changeField(element, value) {
  assert.ok(element, 'Expected a form field');
  await act(async () => {
    const prototype = element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
  await settle();
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
    assert.equal(document.querySelectorAll("h1").length, 1);
    assert.equal(
      document.querySelector("h1").textContent,
      "NAMUNA TOSH MARKAZI",
    );
    assert.match(
      document.querySelector(".hero-badge").textContent,
      /PREMIUM KERAMA GRANIT VA TOSH MAHSULOTLARI/,
    );
    assert.equal(
      document.querySelector(".hero-subtitle").textContent,
      "Sifat va nafislik uyg‘unligi",
    );
    assert.equal(
      document.querySelector(".hero-primary-cta").getAttribute("href"),
      "/products",
    );
    const heroTelegram = document.querySelector(".hero-secondary-cta");
    assert.equal(heroTelegram.href, "https://t.me/aura_200707");
    assert.equal(heroTelegram.target, "_blank");
    assert.match(heroTelegram.rel, /noopener/);
    assert.deepEqual(
      [...document.querySelectorAll(".hero-stat h2")].map(
        (node) => node.textContent,
      ),
      ["Kerama granit", "Sokl va zinapoyalar", "Buyurtma asosida ishlov"],
    );
    assert.match(
      document.querySelector(".product-image-frame img").alt,
      /Black Crystal/,
    );
    assert.equal(
      document
        .querySelector(".product-image-frame img")
        .getAttribute("loading"),
      "eager",
    );
    assert.equal(
      document
        .querySelector(".product-image-frame img")
        .getAttribute("fetchpriority"),
      "high",
    );
    await click(document.querySelector(".scroll-indicator"));
    assert.equal(scrollTarget.id, "mahsulotlar-preview");
    assert.equal(scrollOptions.behavior, "smooth");
    assert.equal(document.activeElement, scrollTarget);
    await click(document.querySelector(".hero-primary-cta"));
    await settle();
    assert.equal(
      window.location.pathname,
      "/products",
      "Hero primary CTA navigates to products",
    );
    assert.equal(document.querySelectorAll('.catalog-card').length, 2);
    assert.equal(document.querySelectorAll('.catalog-card img').length, 2);
    for (const image of document.querySelectorAll('.catalog-card img')) {
      assert.ok(image.src.startsWith('data:image/jpeg'), 'Catalog uses the supplied photos');
    }
    assert.equal(document.querySelectorAll('.product-discount-badge').length, 0, 'Unknown prices have no fabricated discounts');
    await changeField(document.querySelector('.product-sort select'), 'name-desc');
    assert.equal(document.querySelector('.catalog-card h2').textContent, 'Black Crystal');
    await changeField(document.querySelector('#product-search'), 'CRYSTAL');
    assert.equal(document.querySelectorAll('.catalog-card').length, 1);
    assert.equal(document.querySelector('.catalog-card h2').textContent, 'Black Crystal');
    await click(document.querySelector('[aria-label="Qidiruvni tozalash"]'));
    await settle();
    await click(document.querySelector('input[value="sokl"]'));
    await settle();
    assert.match(document.querySelector('.catalog-empty h2').textContent, /Mahsulot topilmadi/);
    await click(document.querySelector('.catalog-empty button'));
    await settle();
    assert.equal(document.querySelectorAll('.catalog-card').length, 2);
    await click(document.querySelector('.catalog-mobile-filter'));
    assert.equal(document.querySelector('.catalog-mobile-filter').getAttribute('aria-expanded'), 'true');
    await act(async () => {
      document.querySelector('#product-filters').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    });
    assert.equal(document.querySelector('.catalog-mobile-filter').getAttribute('aria-expanded'), 'false');
    await changeField(document.querySelector('#product-search'), 'Angola');
    const catalogSearch = window.location.search;
    await click(document.querySelector('.catalog-order-link'));
    await settle();
    assert.equal(window.location.pathname, '/products/angola-black');
    assert.equal(document.querySelector('h1').textContent, 'Angola Black');
    assert.equal(document.activeElement.id, 'buyurtma');
    assert.equal(document.querySelectorAll('.gallery-thumbnails button').length, 2);
    assert.match(document.querySelector('.gallery-navigation span').textContent, /1 \/ 2/);
    await click(document.querySelector('[aria-label="Keyingi rasm"]'));
    await settle();
    assert.match(document.querySelector('.gallery-navigation span').textContent, /2 \/ 2/);
    assert.equal(document.querySelector('.order-text-label textarea'), null, 'Customer must prepare the order after validation');
    assert.match(document.querySelector('.calculator-sizes').textContent, /O‘lchamni aniqlashtirish/);
    assert.equal(document.querySelector('input[name="quantity-mode"][value="pieces"]').disabled, true);
    await click(document.querySelector('.calculator-prepare'));
    assert.equal(document.activeElement.id, 'order-name');
    assert.ok(document.querySelector('#order-name-error'));
    await changeField(document.querySelector('#order-name'), 'Ali');
    await changeField(document.querySelector('#order-phone'), '+998 90');
    await click(document.querySelector('.calculator-prepare'));
    assert.equal(document.activeElement.id, 'order-phone');
    assert.ok(document.querySelector('#order-phone-error'));
    await changeField(document.querySelector('#order-phone'), '+998 90 123 45 67');
    await click(document.querySelector('[aria-label="Miqdorni oshirish"]'));
    assert.equal(document.querySelector('#order-quantity').value, '2');
    await click(document.querySelector('[aria-label="Miqdorni kamaytirish"]'));
    assert.equal(document.querySelector('#order-quantity').value, '1');
    await click(document.querySelector('.calculator-prepare'));
    await settle();
    const orderText = document.querySelector('.order-text-label textarea');
    assert.match(orderText.value, /Mahsulot: Angola Black/);
    assert.match(orderText.value, /O‘lcham aniqlashtiriladi/);
    assert.match(orderText.value, /Mijoz: Ali/);
    assert.match(orderText.value, /Telefon: \+998901234567/);
    assert.equal(document.querySelector('.catalog-telegram-button').href, 'https://t.me/aura_200707');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Clipboard unavailable'); } } });
    await click(document.querySelector('.catalog-copy-button'));
    assert.match(document.querySelector('.order-status').textContent, /Avtomatik nusxalash ishlamadi/);
    assert.equal(document.activeElement, orderText);
    assert.equal(orderText.selectionEnd, orderText.value.length);
    let copiedOrder;
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { copiedOrder = text; } } });
    await click(document.querySelector('.catalog-copy-button'));
    assert.equal(copiedOrder, orderText.value);
    assert.match(document.querySelector('.catalog-copy-button').textContent, /Nusxalandi/);
    await changeField(document.querySelector('[aria-label="Buyurtma miqdori"]'), '0');
    assert.equal(document.querySelector('.calculator-prepare').disabled, true);
    assert.equal(document.querySelector('.catalog-copy-button'), null);
    await changeField(document.querySelector('[aria-label="Buyurtma miqdori"]'), '2.5');
    assert.match(document.querySelector('.order-text-label textarea').value, /Miqdor: 2,5 m²/);
    await click(document.querySelector('.detail-back'));
    await settle();
    assert.equal(window.location.search, catalogSearch, 'Returning to catalog preserves search and filters');
    assert.equal(document.querySelector('#product-search').value, 'Angola');
    assert.equal(document.querySelectorAll('.catalog-card').length, 1);
    await click(document.querySelector(".navbar .brand"));
    await settle();
    assert.equal(window.location.pathname, "/");
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
      ["/discounts", "MAXSUS TAKLIFLAR"],
      ["/about", "NAMUNA TOSH MARKAZI"],
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
    // Test navigating to /contact via footer link (contact section moved to footer)
    await click(document.querySelector('footer a[href="/contact"]'));
    await settle();
    assert.equal(window.location.pathname, "/contact");
    assert.equal(document.querySelector("h1").textContent, "Suhbatdan boshlaymiz.");
    assert.equal(
      document.querySelector(".navbar"),
      originalNavbar,
      "Shared navbar must stay mounted",
    );
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
