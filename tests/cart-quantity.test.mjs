import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';
import { calculateOrder } from '../src/utils/calculatorUtils.js';
import { formatMoney } from '../src/utils/priceUtils.js';

test('cart quantities support typing, validation, buttons, totals and persistence', async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: 'http://localhost/', pretendToBeVisual: true });
  for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Element', 'SVGElement', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent']) globalThis[key] = dom.window[key];
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
  globalThis.cancelAnimationFrame = clearTimeout;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = query => ({ matches: true, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  const area = { id: 'area', name: 'Granit', slug: 'granit', price: 100, priceUnit: 'm2', sizes: [], images: [], orderConfig: { quantityModes: ['direct'] } };
  const piece = { id: 'piece', name: 'Disk', slug: 'disk', price: 50, priceUnit: 'piece', sizes: [], images: [], orderConfig: { quantityModes: ['pieces'] } };
  const seed = [[area, 1, 'direct'], [piece, 2, 'pieces']].map(([product, quantity, mode]) => ({ id: product.id, product, quantity, mode, size: null, calculation: calculateOrder(product, { quantity, mode }) }));
  window.localStorage.setItem('namuna_cart_v1', JSON.stringify(seed));
  const result = await build({
    stdin: { contents: `import {useEffect} from 'react'; import {MemoryRouter} from 'react-router-dom'; import {CartProvider,useCart} from './src/context/CartContext.jsx'; import {LanguageProvider} from './src/context/LanguageContext.jsx'; import CartDrawer from './src/components/Cart/CartDrawer.jsx'; function Open(){const {openCart}=useCart();useEffect(()=>openCart(),[openCart]);return <CartDrawer/>;} export default function App(){return <LanguageProvider><CartProvider><MemoryRouter><Open/></MemoryRouter></CartProvider></LanguageProvider>;}`, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, platform: 'node', format: 'esm', packages: 'external', jsx: 'automatic', loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
  });
  await mkdir('.sites-runtime', { recursive: true });
  const path = resolve('.sites-runtime/test-cart-quantity.mjs');
  await writeFile(path, result.outputFiles[0].contents);
  const { default: App } = await import(pathToFileURL(path).href);
  const { createElement, act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  let root = createRoot(document.getElementById('root'));
  const inputs = () => [...document.querySelectorAll('.yandex-qty-input')];
  const stored = () => JSON.parse(window.localStorage.getItem('namuna_cart_v1'));
  async function type(input, value) {
    await act(async () => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }
  async function wheel(input, deltaY) {
    const event = new dom.window.WheelEvent('wheel', { deltaY, bubbles: true, cancelable: true });
    await act(async () => input.dispatchEvent(event));
    return event;
  }
  try {
    await act(async () => root.render(createElement(App)));
    assert.equal(inputs().length, 2);
    assert.ok(document.querySelector('.cart-summary-total'));
    assert.equal(document.querySelector('.cart-summary-row'), null);
    assert.equal(document.querySelector('.yandex-btn-price'), null);
    await type(inputs()[0], '2.5');
    assert.equal(stored()[0].quantity, 2.5);
    assert.equal(document.querySelector('.cart-summary-total strong').textContent, formatMoney(350));
    assert.equal(document.querySelector('.cart-item-price-sum strong').textContent, formatMoney(250));
    await type(inputs()[1], '3');
    assert.equal(stored()[1].quantity, 3);
    assert.equal(document.querySelector('.cart-summary-total strong').textContent, formatMoney(400));
    assert.equal(document.querySelectorAll('.cart-item-price-sum strong')[1].textContent, formatMoney(150));
    for (const invalid of ['', '0', '-2', '1.234']) {
      await type(inputs()[0], invalid);
      assert.equal(stored()[0].quantity, 2.5, 'Invalid drafts do not change or delete the item');
      assert.equal(stored().length, 2);
      await act(async () => inputs()[0].blur());
      assert.equal(inputs()[0].value, '2.5');
    }
    await type(inputs()[1], '1.5');
    assert.equal(inputs()[1].getAttribute('aria-invalid'), 'true');
    assert.equal(stored()[1].quantity, 3, 'Piece quantities must be integers');
    await act(async () => inputs()[1].blur());
    assert.equal(inputs()[1].value, '3');
    await act(async () => document.querySelectorAll('.cart-item')[1].querySelectorAll('.yandex-step-btn')[1].click());
    assert.equal(inputs()[1].value, '4', 'The plus button synchronizes the typed field');
    await type(inputs()[0], '2.5');
    assert.equal((await wheel(inputs()[0], -100)).defaultPrevented, true);
    assert.equal(stored()[0].quantity, 3, 'Wheel up moves fractional values to the next integer');
    await wheel(inputs()[0], 100);
    assert.equal(stored()[0].quantity, 2, 'Wheel down decreases by one whole unit');
    assert.equal(document.querySelector('.cart-item-price-sum strong').textContent, formatMoney(200));
    await type(inputs()[0], '2.5');
    await wheel(inputs()[0], 100);
    assert.equal(stored()[0].quantity, 2, 'Wheel down moves fractions to the previous integer');
    await type(inputs()[0], '1');
    await wheel(inputs()[0], 100);
    assert.equal(stored()[0].quantity, 1, 'Wheel changes never remove an item');
    await act(async () => inputs()[0].blur());
    assert.equal((await wheel(inputs()[0], -100)).defaultPrevented, false, 'Unfocused fields allow normal page scrolling');
    assert.equal(stored()[0].quantity, 1);
    await type(inputs()[0], '4.25');
    await act(async () => inputs()[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    assert.notEqual(document.activeElement, inputs()[0]);
    assert.equal(document.querySelector('.cart-item-price-sum strong').textContent, formatMoney(425));
    await act(async () => root.unmount());
    root = createRoot(document.getElementById('root'));
    await act(async () => root.render(createElement(App)));
    assert.equal(inputs()[0].value, '4.25');
    assert.equal(inputs()[1].value, '4');
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
