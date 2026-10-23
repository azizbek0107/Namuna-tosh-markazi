import { createServer } from 'node:http';
import { mkdtempSync, readdirSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { authMiddleware } from './auth.js';

test('role buttons create persistent identities and authenticated sessions', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'stonex-role-login-'));
  const middleware = authMiddleware({ directory });
  const server = createServer((req, res) => middleware(req, res, () => res.end()));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const login = (role, site = origin) => fetch(origin + '/api/auth/role-login', { method: 'POST', headers: { Origin: site, 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
  try {
    assert.equal((await login('owner')).status, 400);
    assert.equal((await login('admin', 'https://other.example')).status, 403);
    for (const role of ['admin', 'cashier', 'worker']) {
      const response = await login(role);
      assert.equal(response.status, 200);
      const { user } = await response.json();
      assert.equal(user.role, role);
      assert.equal(user.hash, undefined);
      const cookie = response.headers.get('set-cookie').split(';')[0];
      const session = await fetch(origin + '/api/auth/session', { headers: { Cookie: cookie } });
      assert.equal((await session.json()).user.id, user.id);
      assert.equal((await (await login(role)).json()).user.id, user.id);
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
    for (const file of readdirSync(directory)) unlinkSync(join(directory, file));
    rmdirSync(directory);
  }
});
