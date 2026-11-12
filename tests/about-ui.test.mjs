import assert from 'node:assert/strict';
import { test } from 'node:test';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><head></head><body><div id="root"></div></body></html>', { url: 'http://localhost/about', pretendToBeVisual: true });
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
let observations = 0;
const observed = new Set();
class TestIntersectionObserver {
  constructor(callback) { this.callback = callback; }
  observe(target) { observations++; observed.add(target); queueMicrotask(() => { if (observed.has(target)) this.callback([{ target, isIntersecting: true, intersectionRatio: 1 }], this); }); }
  unobserve(target) { observed.delete(target); }
  disconnect() { observed.clear(); }
}
window.IntersectionObserver = globalThis.IntersectionObserver = TestIntersectionObserver;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const bundle = await build({
  stdin: { contents: "export { default } from './src/App.jsx'; export { aboutSeo, aboutVideo, resolveProductDirections } from './src/data/aboutData.js'; export { realProducts } from './src/data/products.js';", resolveDir: process.cwd(), loader: 'jsx' },
  bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic',
  loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' },
});
await mkdir('.sites-runtime', { recursive: true });
const target = resolve('.sites-runtime/test-about-app.mjs');
await writeFile(target, bundle.outputFiles[0].contents);
const { default: App, aboutSeo, aboutVideo, resolveProductDirections, realProducts } = await import(pathToFileURL(target).href);
const { createElement, act } = await import('react');
const { createRoot } = await import('react-dom/client');
async function settle() { for (let frame = 0; frame < 3; frame++) await act(async () => { await new Promise(resolve => setTimeout(resolve, 100)); }); }
async function click(element) { assert.ok(element); await act(async () => element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))); await settle(); }
async function key(value, options = {}) { await act(async () => document.activeElement.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options }))); await settle(); }

test('About route, truthful content, imagery, SEO, reduced motion and gallery accessibility', async () => {
  const root = createRoot(document.getElementById('root'));
  const errors = [];
  const originalError = console.error, originalWarn = console.warn;
  console.error = (...args) => errors.push(args.join(' '));
  console.warn = (...args) => { const message = args.join(' '); if (!message.startsWith('You have Reduced Motion enabled on your device.')) errors.push(message); };
  try {
    await act(async () => root.render(createElement(App)));
    await settle();
    const navbar = document.querySelector('.navbar');
    assert.equal(document.querySelectorAll('h1').length, 1);
    assert.equal(document.querySelector('h1').textContent, 'NAMUNA TOSH MARKAZI');
    assert.equal(document.title, aboutSeo.title);
    assert.equal(document.querySelector('meta[name="description"]').content, aboutSeo.description);
    assert.equal(document.querySelector('.desktop-navigation [aria-current="page"]').getAttribute('href'), '/about');
    for (const selector of ['.about-hero', '.about-story', '.about-process', '.about-directions', '.about-services', '.about-gallery', '.about-video', '.about-cta']) assert.ok(document.querySelector(selector), selector);
    assert.equal(document.querySelectorAll('.production-timeline li').length, 6);
    assert.match(document.querySelector('.about-process').textContent, /buyurtma talabiga qarab/);
    assert.equal(document.querySelectorAll('.about-direction-card').length, 1, 'Only categories with catalog images are shown');
    assert.equal(document.querySelectorAll('.about-direction-placeholder').length, 0);
    assert.ok(document.querySelector('.about-direction-card img'));
    assert.equal(document.querySelectorAll('.about-service-card').length, 5);
    const galleryButtons = [...document.querySelectorAll('.about-gallery-open')];
    assert.equal(galleryButtons.length, 3);
    for (const image of document.querySelectorAll('.about-page img')) {
      assert.ok(image.alt.length > 0);
      assert.ok(image.src.startsWith('data:image/jpeg'), 'Page uses the existing JPEG assets');
      assert.ok(image.width > 0 && image.height > 0);
    }
    assert.equal(document.querySelector('.about-hero-image img').getAttribute('loading'), 'eager');
    assert.equal(document.querySelector('.about-gallery-open img').getAttribute('loading'), 'lazy');
    assert.equal(document.querySelectorAll('.about-page iframe').length, 0);
    assert.equal(aboutVideo.channelUrl, null);
    assert.equal(document.querySelector('.about-video-link').disabled, true);
    assert.match(document.querySelector('.about-video').textContent, /uzb_yigiti_0107/);
    assert.equal(document.querySelector('.about-cta-actions .gold-button').getAttribute('href'), '/products');
    assert.equal(document.querySelector('.about-telegram-link').href, 'https://t.me/aura_200707');
    assert.equal(document.querySelector('.about-telegram-link').target, '_blank');
    assert.match(document.querySelector('.about-telegram-link').rel, /noopener/);
    assert.ok(observations > 0, 'Scroll reveal sections register with IntersectionObserver');
    assert.ok(['', 'none'].includes(document.querySelector('.about-story').style.transform), 'Reduced motion leaves the section stationary');

    await click(document.querySelector('.theme-toggle'));
    assert.equal(document.documentElement.dataset.theme, 'dark');
    await click(document.querySelector('.theme-toggle'));
    assert.equal(document.documentElement.dataset.theme, 'light');
    await click(galleryButtons[0]);
    const closeButton = () => document.querySelector('[aria-label="Galereyani yopish"]');
    assert.equal(document.querySelector('[role="dialog"]').getAttribute('aria-modal'), 'true');
    assert.equal(document.getElementById('site-shell').inert, true);
    assert.equal(document.body.style.overflow, 'hidden');
    assert.equal(document.activeElement, closeButton());
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '1 / 3');
    await key('ArrowRight');
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '2 / 3');
    assert.equal(document.querySelector('.about-lightbox img').src, galleryButtons[1].querySelector('img').src);
    await key('End');
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '3 / 3');
    await click(document.querySelector('[aria-label="Keyingi galereya rasmi"]'));
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '1 / 3');
    await click(document.querySelector('[aria-label="Oldingi galereya rasmi"]'));
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '3 / 3');
    await act(async () => closeButton().focus());
    await key('Tab', { shiftKey: true });
    assert.equal(document.activeElement.getAttribute('aria-label'), 'Keyingi galereya rasmi');
    await key('Tab');
    assert.equal(document.activeElement, closeButton());
    await act(async () => document.querySelector('.navbar .brand').focus());
    assert.equal(document.activeElement, closeButton(), 'Programmatic focus cannot escape the modal');
    await key('Escape');
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement, galleryButtons[0]);
    assert.equal(document.getElementById('site-shell').inert, false);
    assert.equal(document.body.style.overflow, '');
    await click(galleryButtons[1]);
    assert.equal(document.querySelector('.about-lightbox-count').textContent, '2 / 3');
    await act(async () => document.querySelector('.about-lightbox img').dispatchEvent(new Event('error')));
    assert.ok(document.querySelector('.about-lightbox .catalog-image-placeholder'));
    await key('Home');
    assert.ok(document.querySelector('.about-lightbox img'), 'Switching image recovers from a load failure');
    await click(closeButton());
    assert.equal(document.activeElement, galleryButtons[1]);
    await click(galleryButtons[2]);
    await click(document.querySelector('.about-lightbox-layer'));
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.activeElement, galleryButtons[2]);

    await click(document.querySelector('.about-direction-copy a[href="/products?category=kerama-granit"]'));
    assert.equal(window.location.pathname, '/products');
    assert.equal(window.location.search, '?category=kerama-granit');
    assert.notEqual(document.querySelector('meta[name="description"]').content, aboutSeo.description, 'About SEO does not leak into another route');
    assert.equal(document.querySelector('.navbar'), navbar);
    await click(document.querySelector('.desktop-navigation a[href="/about"]'));
    assert.equal(document.title, aboutSeo.title);
    const firstDirectionImage = document.querySelector('.about-direction-card img').src;
    await act(async () => document.querySelector('.about-direction-card img').dispatchEvent(new Event('error')));
    assert.notEqual(document.querySelector('.about-direction-card img').src, firstDirectionImage, 'A broken image falls back to another image in the same category');
    for (let i = 0; i < 2; i++) {
      await act(async () => document.querySelector('.about-direction-card img').dispatchEvent(new Event('error')));
    }
    assert.equal(document.querySelector('.about-directions'), null, 'No empty section remains after all category images fail');
    await click(document.querySelector('.about-gallery-open'));
    await act(async () => { window.history.pushState({}, '', '/products'); window.dispatchEvent(new Event('popstate')); });
    await settle();
    assert.equal(document.querySelector('[role="dialog"]'), null);
    assert.equal(document.body.style.overflow, '');
    assert.equal(document.getElementById('site-shell').inert, false);
    assert.equal(document.activeElement.id, 'main-content', 'Leaving the route restores focus to the current page');
    assert.equal(errors.length, 0, errors.join('\n'));
  } finally {
    await act(async () => root.unmount());
    console.error = originalError; console.warn = originalWarn;
    assert.equal(document.body.style.overflow, '');
    dom.window.close();
  }
});

test('About category cards use existing images from their own catalog category', async () => {
  const directions = resolveProductDirections(realProducts);
  assert.deepEqual(directions.map(item => item.id), ['kerama-granit', 'granit', 'kafel', 'tayyor-mahsulot', 'qoshimcha']);
  for (const direction of directions) {
    assert.ok(realProducts.some(product => product.isVisible && product.category === direction.id && product.images.some(image => image.src === direction.image.src)));
    await access(resolve('public', direction.image.src.replace(/^\//, '')));
  }
  const catalog = [
    { category: 'granit', isVisible: true, images: [{ url: '/first.jpg' }, { src: '/second.jpg' }] },
    { category: 'kafel', isVisible: false, images: ['/hidden.jpg'] },
    { category: 'tayyor-mahsulot', isVisible: true, images: [] },
  ];
  assert.deepEqual(resolveProductDirections(catalog).map(item => item.id), ['granit']);
  assert.equal(resolveProductDirections(catalog, new Set(['/first.jpg']))[0].image.src, '/second.jpg');
  assert.equal(resolveProductDirections(catalog, new Set(['/first.jpg', '/second.jpg'])).length, 0);
});
