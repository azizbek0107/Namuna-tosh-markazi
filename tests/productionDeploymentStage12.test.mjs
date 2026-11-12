import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

describe('Stage 12: Production Readiness & Deployment Verification', () => {
  const rootDir = resolve('.');

  it('has comprehensive .gitignore protecting all secret environment files', () => {
    const gitignorePath = resolve(rootDir, '.gitignore');
    assert.ok(existsSync(gitignorePath), '.gitignore file must exist');
    const content = readFileSync(gitignorePath, 'utf8');
    assert.ok(content.includes('.env'), 'must ignore .env');
    assert.ok(content.includes('.env.local'), 'must ignore .env.local');
    assert.ok(content.includes('dist'), 'must ignore dist build folder');
    assert.ok(content.includes('node_modules'), 'must ignore node_modules');
  });

  it('has documented production .env.example with zero hardcoded secrets', () => {
    const envExamplePath = resolve(rootDir, '.env.example');
    assert.ok(existsSync(envExamplePath), '.env.example must exist');
    const content = readFileSync(envExamplePath, 'utf8');
    assert.ok(content.includes('VITE_STONEX_ERP_API_URL'), 'must document ERP URL');
    assert.ok(content.includes('VITE_SUPABASE_URL'), 'must document Supabase URL');
    assert.ok(content.includes('VITE_SITE_URL'), 'must document canonical site URL');
    assert.ok(!content.includes('secret_'), 'must not contain real secret values');
  });

  it('has valid robots.txt protecting admin routes while allowing catalog indexing', () => {
    const robotsPath = resolve(rootDir, 'public/robots.txt');
    assert.ok(existsSync(robotsPath), 'public/robots.txt must exist');
    const content = readFileSync(robotsPath, 'utf8');
    assert.ok(content.includes('Disallow: /admin'), 'must disallow /admin');
    assert.ok(content.includes('Allow: /products'), 'must allow /products');
    assert.ok(content.includes('Sitemap: https://namunatosh.uz/sitemap.xml'), 'must declare sitemap');
  });

  it('has valid sitemap.xml listing all canonical pages', () => {
    const sitemapPath = resolve(rootDir, 'public/sitemap.xml');
    assert.ok(existsSync(sitemapPath), 'public/sitemap.xml must exist');
    const content = readFileSync(sitemapPath, 'utf8');
    assert.ok(content.includes('<loc>https://namunatosh.uz/</loc>'), 'includes home');
    assert.ok(content.includes('<loc>https://namunatosh.uz/products</loc>'), 'includes products');
    assert.ok(content.includes('<loc>https://namunatosh.uz/discounts</loc>'), 'includes discounts');
    assert.ok(content.includes('<loc>https://namunatosh.uz/about</loc>'), 'includes about');
    assert.ok(content.includes('<loc>https://namunatosh.uz/contact</loc>'), 'includes contact');
    assert.ok(!content.includes('/admin'), 'sitemap must never list admin pages');
  });

  it('has SPA routing redirects for Netlify and Cloudflare Pages', () => {
    const redirectsPath = resolve(rootDir, 'public/_redirects');
    assert.ok(existsSync(redirectsPath), 'public/_redirects must exist');
    const content = readFileSync(redirectsPath, 'utf8');
    assert.ok(content.includes('/*    /index.html   200'), 'must include 200 rewrite fallback for SPA');
  });

  it('has valid vercel.json with SPA rewrites and production security headers', () => {
    const vercelPath = resolve(rootDir, 'vercel.json');
    assert.ok(existsSync(vercelPath), 'vercel.json must exist');
    const config = JSON.parse(readFileSync(vercelPath, 'utf8'));
    assert.ok(Array.isArray(config.rewrites), 'rewrites must be array');
    assert.equal(config.rewrites[0].destination, '/index.html');
    assert.ok(Array.isArray(config.headers), 'headers must be defined');
    const globalHeader = config.headers.find(h => h.source === '/(.*)');
    assert.ok(globalHeader, 'must have global security headers');
    const headerKeys = globalHeader.headers.map(h => h.key);
    assert.ok(headerKeys.includes('X-Frame-Options'), 'must enforce X-Frame-Options');
    assert.ok(headerKeys.includes('X-Content-Type-Options'), 'must enforce nosniff');
  });

  it('has comprehensive SEO, OpenGraph and Schema.org metadata in index.html', () => {
    const indexPath = resolve(rootDir, 'index.html');
    assert.ok(existsSync(indexPath), 'index.html must exist');
    const html = readFileSync(indexPath, 'utf8');
    assert.ok(html.includes('rel="canonical"'), 'must include canonical tag');
    assert.ok(html.includes('og:title'), 'must include og:title');
    assert.ok(html.includes('og:image'), 'must include og:image');
    assert.ok(html.includes('twitter:card'), 'must include twitter card');
    assert.ok(html.includes('application/ld+json'), 'must include Schema.org JSON-LD structured data');
    assert.ok(html.includes('Namuna Tosh Markazi'), 'must include brand name in structured data');
  });

  it('has production chunking configured in vite.config.js to eliminate oversized bundles', () => {
    const viteConfigPath = resolve(rootDir, 'vite.config.js');
    const content = readFileSync(viteConfigPath, 'utf8');
    assert.ok(content.includes('manualChunks'), 'must configure manualChunks');
    assert.ok(content.includes('vendor-react'), 'must split react vendor chunk');
    assert.ok(content.includes('vendor-motion'), 'must split motion vendor chunk');
  });
});

