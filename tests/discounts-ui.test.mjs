import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';
import { discountTestNow, discountTestProducts } from './fixtures/discountProducts.mjs';

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost/discounts', pretendToBeVisual: true });
for (const key of ['window', 'document', 'HTMLElement', 'Element', 'SVGElement', 'Node', 'MouseEvent', 'KeyboardEvent', 'Event']) globalThis[key] = dom.window[key];
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
Object.defineProperty(globalThis, 'navigator', { configurable: true, value: dom.window.navigator });
globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
globalThis.cancelAnimationFrame = clearTimeout;
window.requestAnimationFrame = globalThis.requestAnimationFrame;
window.cancelAnimationFrame = globalThis.cancelAnimationFrame;
window.scrollTo = () => {};
HTMLElement.prototype.scrollIntoView = () => {};
window.matchMedia = query => ({ matches: query.includes('prefers-reduced-motion'), media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const bundle = await build({
  entryPoints: ['src/App.jsx'], bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic',
  loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
  // Test-only adapter: exercise the actual service/routes/components without editing business data.
  plugins: [{ name: 'synthetic-promotions', setup(builder) { builder.onLoad({ filter: /[\\/]data[\\/]products\.js$/ }, () => ({ contents: `export const products = ${JSON.stringify(discountTestProducts)};`, loader: 'js' })); } }],
});
await mkdir('.sites-runtime', { recursive: true });
const target = resolve('.sites-runtime/test-discounts-app.mjs');
await writeFile(target, bundle.outputFiles[0].contents);
const { default: App } = await import(pathToFileURL(target).href);
const { createElement, act } = await import('react');
const { createRoot } = await import('react-dom/client');
async function settle() { for (let frame = 0; frame < 3; frame++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)); }); }
async function click(element) {
  assert.ok(element);
  await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })));
  await settle();
}
async function field(element, value) {
  assert.ok(element);
  await act(async () => {
    const prototype = element.tagName === 'SELECT' ? window.HTMLSelectElement.prototype : window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value').set.call(element, value);
    element.dispatchEvent(new Event(element.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
  await settle();
}

test('promotions UI filters, theme, calculator, Telegram, expiry and conditional Home banner', async t => {
  t.mock.timers.enable({ apis: ['Date', 'setInterval'], now: discountTestNow });
  const root = createRoot(document.getElementById('root'));
  const errors = [];
  const oldError = console.error;
  const oldWarn = console.warn;
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => {
    const message = args.join(' ');
    // Motion emits this expected development notice when testing reduced motion.
    if (message.startsWith('You have Reduced Motion enabled on your device.')) return;
    errors.push(message);
  };
  try {
    await act(async () => root.render(createElement(App)));
    await settle();
    assert.equal(document.querySelector('h1').textContent, 'MAXSUS TAKLIFLAR');
    assert.equal(document.querySelectorAll('.discount-card').length, 2);
    assert.equal(document.querySelectorAll('.discount-countdown-clock').length, 2);
    assert.match(document.querySelector('.discount-card .product-price del').textContent, /250 000/);
    assert.match(document.querySelector('.discount-card .product-price>span').textContent, /200 000/);
    assert.match(document.querySelectorAll('.discount-card')[1].textContent, /buyurtmadan bir marta/);
    await click(document.querySelector('.discount-filter-toggle'));
    assert.equal(document.querySelector('.discount-filter-toggle').getAttribute('aria-expanded'), 'true');
    await act(async () => document.querySelector('#discount-filters').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    assert.equal(document.querySelector('.discount-filter-toggle').getAttribute('aria-expanded'), 'false');
    await click(document.querySelector('input[name="discount-category"][value="sokl"]'));
    assert.equal(document.querySelectorAll('.discount-card').length, 1);
    await click(document.querySelector('input[name="discount-type"][value="percentage"]'));
    assert.match(document.querySelector('#discount-empty-title').textContent, /mos aksiya topilmadi/);
    await click(document.querySelector('.discount-empty .discount-clear-button'));
    assert.equal(document.querySelectorAll('.discount-card').length, 2);
    await field(document.querySelector('.discount-sort select'), 'ending');
    assert.equal(document.querySelector('.discount-card h2').textContent, 'Foizli namuna');
    const discountSearch = window.location.search;
    await click(document.querySelectorAll('.discount-card .catalog-order-link')[1]);
    await settle();
    assert.equal(window.location.pathname, '/products/test-fixed');
    await field(document.querySelector('#order-quantity'), '2');
    assert.match(document.querySelector('.calculator-final').textContent, /550 000/);
    assert.match(document.querySelector('.calculator-discount').textContent, /50 000/);
    await field(document.querySelector('#order-name'), 'Test mijoz');
    await field(document.querySelector('#order-phone'), '901234567');
    await click(document.querySelector('.calculator-prepare'));
    const text = document.querySelector('.order-text-label textarea').value;
    assert.match(text, /Jami: 550 000 so‘m/);
    assert.match(text, /Chegirma: 50 000 so‘m/);
    assert.equal(document.querySelector('.catalog-telegram-button').href, 'https://t.me/aura_200707');
    await click(document.querySelector('.detail-back'));
    assert.equal(window.location.pathname, '/discounts');
    assert.equal(window.location.search, discountSearch);
    await click(document.querySelector('.theme-toggle'));
    assert.equal(document.documentElement.dataset.theme, 'dark');
    await click(document.querySelector('.theme-toggle'));
    assert.equal(document.documentElement.dataset.theme, 'light');
    await act(async () => t.mock.timers.tick(5001));
    await settle();
    assert.equal(document.querySelectorAll('.discount-card').length, 1);
    assert.match(document.querySelector('.discount-expiry-notice').textContent, /Aksiya yakunlandi/);
    await click(document.querySelector('.navbar .brand'));
    assert.ok(document.querySelector('.discount-banner a[href="/discounts"]'));
    await act(async () => t.mock.timers.tick(5000));
    await settle();
    assert.equal(document.querySelector('.discount-banner'), null);
    await click(document.querySelector('.desktop-navigation a[href="/discounts"]'));
    assert.equal(document.querySelectorAll('.discount-card').length, 0);
    assert.equal(document.querySelector('#discount-empty-title').textContent, 'Hozircha faol chegirmalar mavjud emas');
    assert.equal(document.querySelector('.discount-empty a').getAttribute('href'), '/products');
    assert.equal(errors.length, 0, errors.join('\n'));
  } finally {
    await act(async () => root.unmount());
    console.error = oldError; console.warn = oldWarn;
    dom.window.close();
  }
});
