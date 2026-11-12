import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { JSDOM } from 'jsdom';

test('admin URLs and stale local test sessions cannot bypass server login', async () => {
  const dom = new JSDOM('<html><body><div id="root"></div></body></html>', { url: 'http://localhost/admin/products', pretendToBeVisual: true });
  for (const key of ['window', 'document', 'HTMLElement', 'HTMLInputElement', 'Element', 'SVGElement', 'Node', 'Event', 'MouseEvent']) globalThis[key] = dom.window[key];
  globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
  Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
  globalThis.requestAnimationFrame = callback => setTimeout(() => callback(performance.now()), 16);
  globalThis.cancelAnimationFrame = clearTimeout;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  window.matchMedia = query => ({ matches: true, media: query, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  window.scrollTo = () => {};
  const legacyKey = 'namuna_mock_admin_session';
  window.localStorage.setItem(legacyKey, 'true');
  window.sessionStorage.setItem(legacyKey, 'true');
  const result = await build({ entryPoints: ['src/App.jsx'], bundle: true, write: false, format: 'esm', platform: 'node', packages: 'external', jsx: 'automatic', define: { 'import.meta.env': '{}' }, loader: { '.css': 'empty', '.jpg': 'dataurl', '.png': 'dataurl' } });
  await mkdir('.sites-runtime', { recursive: true });
  const path = resolve('.sites-runtime/test-admin-access.mjs');
  await writeFile(path, result.outputFiles[0].contents);
  const { default: App } = await import(pathToFileURL(path).href);
  const { createElement, act } = await import('react');
  const { createRoot } = await import('react-dom/client');
  let root = createRoot(document.getElementById('root'));
  const pause = () => new Promise(resolve => setTimeout(resolve, 40));
  async function settleLogin() {
    for (let i = 0; i < 30 && (!document.querySelector('.auth-form') || window.location.pathname !== '/admin/login'); i++) await act(pause);
    assert.equal(window.location.pathname, '/admin/login');
    assert.ok(document.querySelector('.auth-form'));
    assert.equal(document.querySelector('.admin-sidebar'), null);
    assert.ok(!document.body.textContent.includes('Admin panelga to‘g‘ridan-to‘g‘ri o‘tish'));
  }
  try {
    await act(async () => root.render(createElement(App)));
    await settleLogin();
    assert.equal(window.localStorage.getItem(legacyKey), null);
    assert.equal(window.sessionStorage.getItem(legacyKey), null);
    for (const route of ['/admin', '/admin/products', '/admin/categories', '/admin/discounts', '/admin/settings']) {
      await act(async () => {
        window.history.pushState({}, '', route);
        window.dispatchEvent(new Event('popstate'));
        await pause();
      });
      await settleLogin();
    }
    for (const [selector, value] of [['#admin-email', 'admin@example.com'], ['#admin-password', 'invalid-test-password']]) {
      await act(async () => {
        const input = document.querySelector(selector);
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, value);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    await act(async () => document.querySelector('.auth-form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })));
    await settleLogin();
    assert.match(document.querySelector('.auth-general-error').textContent, /Supabase loyihasi ulanmagan/);
    assert.equal(window.localStorage.getItem(legacyKey), null);
    window.localStorage.setItem(legacyKey, 'true');
    await act(async () => root.unmount());
    window.history.replaceState({}, '', '/admin');
    root = createRoot(document.getElementById('root'));
    await act(async () => root.render(createElement(App)));
    await settleLogin();
  } finally {
    await act(async () => root.unmount());
    dom.window.close();
  }
});
