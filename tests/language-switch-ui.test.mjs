import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { translations, getTranslatedProduct } from '../src/utils/translations.js';

test('language selection updates visible pages, cart and persisted selection', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
  dom.window.document.head.innerHTML = '<meta property="og:title"><meta property="og:site_name"><meta property="og:description"><meta name="twitter:title"><script type="application/ld+json">{"@type":"LocalBusiness","name":"Namuna Tosh Markazi"}</script>';
  for (const key of ['window', 'document', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'MouseEvent', 'Event']) globalThis[key] = dom.window[key];
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
  globalThis.cancelAnimationFrame = clearTimeout;
  window.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion'), media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  HTMLElement.prototype.scrollIntoView = () => {};
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const result = await build({ entryPoints: ['src/App.jsx'], bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' } });
  await mkdir('.sites-runtime', { recursive: true });
  const path = resolve('.sites-runtime/test-language-switch.mjs');
  await writeFile(path, result.outputFiles[0].contents);
  const { default: App } = await import(pathToFileURL(path).href);
  const { createElement, act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  let root = createRoot(document.getElementById('root'));
  const pause = () => new Promise(resolve => setTimeout(resolve, 60));
  async function click(element) {
    assert.ok(element, 'Expected an interactive element');
    await act(async () => { element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); await pause(); });
  }
  async function settle(selector) {
    for (let i = 0; i < 30 && !document.querySelector(selector); i++) await act(pause);
    assert.ok(document.querySelector(selector), selector);
  }
  async function language(code) {
    await click(document.querySelector('.navbar .lang-selector-btn'));
    const option = [...document.querySelectorAll('.navbar .lang-option-btn')][['uz', 'oz', 'ru', 'en'].indexOf(code)];
    await click(option);
    assert.equal(window.localStorage.getItem('namuna_lang'), code);
    assert.equal(document.documentElement.lang, code === 'oz' ? 'uz-Cyrl' : code);
  }
  try {
    await act(async () => { root.render(createElement(App)); await pause(); });
    const originalLogo = document.querySelector('.navbar .brand-logo').src;
    for (const code of ['en', 'ru', 'oz', 'uz']) {
      await language(code);
      assert.equal(document.querySelector('.hero-description').textContent, translations[code]['hero.description']);
      assert.ok(['angola-1', 'angola-2', 'crystal'].some(id => document.querySelector('.product-slide-copy p').textContent === translations[code][`carousel.${id}.description`]));
      assert.equal(document.querySelector('.scroll-indicator span').textContent, translations[code]['common.scroll']);
      assert.equal(document.querySelector('.navbar .brand-logo').src, originalLogo, 'Language changes preserve the original logo');
      assert.equal(document.querySelector('.navbar .brand-logo').alt, 'Namuna Tosh Jilo logotipi');
      assert.equal(document.querySelector('.brand-localized-name'), null);
      assert.ok(document.querySelector('.footer-bottom small').textContent.includes(translations[code]['brand.name']));
      assert.equal(document.querySelector('#hero-title').textContent, translations[code]['brand.title']);
      assert.ok(document.title.includes(translations[code]['brand.name']));
      assert.equal(document.querySelector('meta[property="og:title"]').content, document.title);
      assert.equal(document.querySelector('meta[property="og:site_name"]').content, translations[code]['brand.name']);
      assert.equal(JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent).name, translations[code]['brand.name']);
    }
    await language('en');
    await click(document.querySelector('.navbar a[href="/products"]'));
    await settle('.catalog-card');
    assert.equal(document.querySelector('.catalog-card-description').textContent, getTranslatedProduct({ slug: 'angola-black' }, 'en').description);
    assert.equal(document.querySelector('.order-btn').textContent.trim(), translations.en['product.order_btn']);
    await click(document.querySelector('.order-btn'));
    assert.equal(document.querySelector('.order-qty-input').placeholder, 'Quantity');
    await click(document.querySelector('.order-qty-confirm-btn'));
    await settle('.cart-drawer');
    assert.ok(document.querySelector('.cart-drawer').textContent.includes(translations.en['product.order_btn']));
    assert.ok(document.querySelector('.cart-summary-total').textContent.includes(translations.en['cart.total']));
    await click(document.querySelector('.cart-close-btn'));
    await click(document.querySelector('.catalog-detail-link'));
    await settle('.product-details-copy');
    for (const code of ['ru', 'en']) {
      await language(code);
      assert.equal(document.title, `${document.querySelector('.product-details-copy h1').textContent} — ${translations[code]['brand.name']}`);
      assert.equal(document.querySelector('meta[property="og:title"]').content, document.title);
    }
    await click(document.querySelector('.navbar a[href="/about"]'));
    await settle('.about-page');
    assert.equal(document.querySelector('#why-title').textContent, translations.en['why.title']);
    await language('ru');
    assert.equal(document.querySelector('#why-title').textContent, translations.ru['why.title']);
    assert.equal(document.querySelector('.about-hero h1').textContent, translations.ru['brand.title']);
    assert.ok(document.querySelector('.about-story-copy').textContent.includes(translations.ru['brand.name']));
    assert.ok(!document.querySelector('.about-page').textContent.includes('Namuna Tosh Markazi'));
    await click(document.querySelector('footer a[href="/contact"]'));
    await settle('.contact-page');
    assert.ok(document.querySelector('.contact-page').textContent.includes(translations.ru['contact.title']));
    assert.equal(document.querySelector('.art-caption').textContent, `${translations.ru['brand.short']} / ${translations.ru['brand.descriptor']}`);
    await act(async () => root.unmount());
    root = createRoot(document.getElementById('root'));
    await act(async () => { root.render(createElement(App)); await pause(); });
    await settle('.contact-page');
    assert.equal(document.querySelector('.lang-code-text').textContent, 'RU');
    assert.ok(document.querySelector('.contact-page').textContent.includes(translations.ru['contact.title']));
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});

test('imported catalog translations preserve dimensions and stock', () => {
  const product = { name: 'Angola Black', slug: 'angola-black-1209', category: 'kerama-granit', description: 'Angola Black — sort 1. Kerama granit toifasidagi yuqori sifatli mahsulot. O‘lchami: 120 × 60 sm. Omborda mavjud: 1411.4 m².', price: 350000 };
  for (const lang of ['ru', 'en', 'oz']) {
    const translated = getTranslatedProduct(product, lang);
    assert.notEqual(translated.description, product.description);
    assert.ok(translated.description.includes('120 × 60'));
    assert.ok(translated.description.includes('1411.4'));
    assert.equal(translated.price, product.price);
  }
  assert.equal(getTranslatedProduct(product, 'uz'), product);
});
