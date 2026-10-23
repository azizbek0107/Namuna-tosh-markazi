import test from 'node:test';
import assert from 'node:assert/strict';
import { createVercelHandler } from './vercelHandler.js';

const env = { UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test', VERCEL_ENV: 'production' };
function fakeRedis() {
  const values = new Map();
  return async (_url, options) => {
    const [command, ...args] = JSON.parse(options.body);
    let result;
    if (command === 'GET') result = values.get(args[0]) ?? null;
    else {
      const [, , key, previous, updated] = args;
      result = (values.get(key) ?? '') === previous ? 1 : 0;
      if (result) values.set(key, updated);
    }
    return { ok: true, json: async () => ({ result }) };
  };
}
async function call(handler, route, { body, cookie } = {}) {
  const output = { headers: {} };
  const req = {
    query: { route }, url: '/api', method: body === undefined ? 'GET' : 'POST', body,
    headers: { host: 'test.vercel.app', origin: 'https://test.vercel.app', cookie, 'x-forwarded-for': '127.0.0.1' },
  };
  await handler(req, {
    writeHead(status, headers) { output.status = status; Object.assign(output.headers, headers); },
    end(body) { output.body = JSON.parse(body); },
  });
  return output;
}

test('Vercel session and logout persist across separate function instances', async () => {
  const redis = fakeRedis();
  const first = createVercelHandler(env, redis);
  const login = await call(first, 'auth/role-login', { body: { role: 'admin' } });
  assert.equal(login.status, 200);
  assert.match(login.headers['Set-Cookie'], /HttpOnly.*Secure/);
  const cookie = login.headers['Set-Cookie'].split(';')[0];
  const second = createVercelHandler(env, redis);
  const session = await call(second, 'auth/session', { cookie });
  assert.equal(session.body.user.id, login.body.user.id);
  await call(second, 'auth/logout', { cookie, body: {} });
  assert.equal((await call(first, 'auth/session', { cookie })).body.user, null);
});

test('concurrent function writes retain both bonuses and one shared role account', async () => {
  const redis = fakeRedis();
  const first = createVercelHandler(env, redis), second = createVercelHandler(env, redis);
  const logins = await Promise.all([first, second].map((handler) => call(handler, 'auth/role-login', { body: { role: 'admin' } })));
  assert.equal(logins[0].body.user.id, logins[1].body.user.id);
  const cookie = logins[0].headers['Set-Cookie'].split(';')[0];
  const writes = await Promise.all([first, second].map((handler, index) => call(handler, 'auth/bonuses', {
    cookie, body: { employeeId: String(index), name: `Employee ${index}`, day: '2026-10-23', amount: 1000, note: '' },
  })));
  assert.ok(writes.every((result) => result.status === 200));
  assert.equal((await call(first, 'auth/bonuses', { cookie })).body.bonuses.length, 2);
});

test('missing or unavailable storage fails clearly without granting a session', async () => {
  const missing = await call(createVercelHandler({}), 'auth/session');
  assert.equal(missing.status, 503);
  assert.match(missing.body.error, /Upstash Redis/);
  const unavailable = await call(createVercelHandler(env, async () => { throw new Error('offline'); }), 'auth/role-login', { body: { role: 'admin' } });
  assert.equal(unavailable.status, 503);
  assert.equal(unavailable.headers['Set-Cookie'], undefined);
});
