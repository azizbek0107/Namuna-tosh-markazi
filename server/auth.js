import { attendanceStore } from "./attendance.js";
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';

const publicUser = ({ id, login, name, role, employeeId }) => ({ id, login, name, role, employeeId });
export function authMiddleware({ directory = resolve('.local-data'), secure = false } = {}) {
  const file = resolve(directory, 'users.json');
  const attendance = attendanceStore(directory);
  const attendanceFile = resolve(directory, 'attendance.json');
  const attendanceMarksFile = resolve(directory, 'attendance-marks.json');
  const readAttendanceMarks = () => existsSync(attendanceMarksFile) ? JSON.parse(readFileSync(attendanceMarksFile, 'utf8')) : [];
  const bonusesFile = resolve(directory, 'bonuses.json');
  const readBonuses = () => existsSync(bonusesFile) ? JSON.parse(readFileSync(bonusesFile, 'utf8')) : [];
  const readAttendance = () => existsSync(attendanceFile) ? JSON.parse(readFileSync(attendanceFile, 'utf8')) : [];
  let users = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
  const sessions = new Map(), attempts = new Map();
  const persist = (next) => {
    mkdirSync(directory, { recursive: true });
    writeFileSync(file + '.tmp', JSON.stringify(next), { mode: 0o600 });
    renameSync(file + '.tmp', file); users = next;
  };
  const cookie = (token, age) => `stonex-session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${age}${secure ? '; Secure' : ''}`;
  return async (req, res, next) => {
    const originalPath = req.url?.split('?')[0];
    const path = originalPath?.replace(/^\/(?:api\/)?attendance(?=\/|$)/, '/api/auth/attendance');
    if (!path?.startsWith('/api/')) return next();
    const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
    try {
      const stored = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
      if (JSON.stringify(stored) !== JSON.stringify(users)) {
        users = stored;
        sessions.clear();
        attempts.clear();
      }
    } catch { return send(503, { error: 'Akkauntlar faylini o‘qib bo‘lmadi.' }); }
    const token = req.headers.cookie?.split('; ').find((part) => part.startsWith('stonex-session='))?.slice(15);
    const session = sessions.get(token);
    if (session && session.expires <= Date.now()) sessions.delete(token);
    const user = session?.expires > Date.now() ? users.find((item) => item.id === session.id) : null;
    if (req.method !== 'GET' && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return send(403, { error: 'So‘rov manbasi ruxsat etilmagan.' });
    if (path === '/api/auth/session' && req.method === 'GET') return send(200, { user: user ? publicUser(user) : null, setup: users.length === 0 });
    if (!path.startsWith('/api/auth/')) {
      if (!user) return send(401, { error: 'Tizimga kiring.' });
      if (user.role !== 'admin') return send(403, { error: 'Bu bo‘limga ruxsat yo‘q.' });
      return next();
    }
    if (path === '/api/auth/logout' && req.method === 'POST') {
      sessions.delete(token); res.setHeader('Set-Cookie', cookie('', 0)); return send(200, { ok: true });
    }
    if (path === '/api/auth/users' && req.method === 'GET') return user?.role === 'admin' ? send(200, { users: users.map(publicUser) }) : send(403, { error: 'Ruxsat yo‘q.' });
    if (path === '/api/auth/bonuses' && req.method === 'GET') {
      if (user?.role !== 'admin') return send(403, { error: 'Ruxsat yo‘q.' });
      try { return send(200, { bonuses: readBonuses() }); }
      catch { return send(503, { error: 'Bonuslarni o‘qib bo‘lmadi.' }); }
    }
    if (path === '/api/auth/attendance' && req.method === 'GET') {
      if (!user) return send(401, { error: 'Tizimga kiring.' });
      try { return send(200, attendance.snapshot(user)); }
      catch { return send(503, { error: 'Davomatni serverdan olib bo‘lmadi. Qayta urinib ko‘ring.' }); }
    }
    if (req.method !== 'POST') return send(405, { error: 'Usul ruxsat etilmagan.' });
    try {
      let body = '';
      for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 8192) return send(413, { error: 'So‘rov juda katta.' }); }
      const data = JSON.parse(body);
      if (path === '/api/auth/attendance/mark') {
        if (user?.role !== 'admin') return send(403, { error: 'Faqat admin davomatni tasdiqlaydi.' });
        const day = String(data.day ?? ''), employeeId = String(data.employeeId ?? '');
        if (!employeeId || !String(data.name ?? '').trim() || !['present', 'absent'].includes(data.status) || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day) return send(400, { error: 'Xodim, sana va davomat holatini tanlang.' });
        const today = new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10);
        if (day > today) return send(400, { error: 'Kelajak kun uchun davomat belgilanmaydi.' });
        const start = Date.parse(day + 'T00:00:00+05:00'), end = start + 86400000;
        if (data.status === 'absent' && readAttendance().some((item) => !item.cancelledAt && String(item.employeeId) === employeeId && Date.parse(item.arrivedAt) < end && (!item.leftAt || Date.parse(item.leftAt) >= start))) return send(409, { error: 'Bu kunda xodimning kelgani qayd etilgan.' });
        const rows = readAttendanceMarks(), old = rows.find((item) => item.employeeId === employeeId && item.day === day);
        const record = { employeeId, name: String(data.name).trim().slice(0, 150), day, status: data.status, confirmedAt: new Date().toISOString(), confirmedBy: user.name, history: [...(old?.history ?? []), ...(old ? [{ status: old.status, confirmedAt: old.confirmedAt, confirmedBy: old.confirmedBy }] : [])] };
        const marks = [record, ...rows.filter((item) => item !== old)];
        mkdirSync(directory, { recursive: true }); writeFileSync(attendanceMarksFile + '.tmp', JSON.stringify(marks), { mode: 0o600 }); renameSync(attendanceMarksFile + '.tmp', attendanceMarksFile);
        return send(200, { marks });
      }
      if (path === '/api/auth/bonuses') {
        if (user?.role !== 'admin') return send(403, { error: 'Faqat admin bonus belgilaydi.' });
        const amount = Number(data.amount), day = String(data.day ?? '');
        if (!data.employeeId || !String(data.name ?? '').trim() || !/^\d{4}-\d{2}-\d{2}$/.test(day) || !Number.isFinite(Date.parse(day)) || new Date(day).toISOString().slice(0, 10) !== day || data.amount === '' || !Number.isFinite(amount) || amount < 0 || amount > 1e12 || String(data.note ?? '').length > 300) return send(400, { error: 'Xodim, sana va to‘g‘ri bonus summasini kiriting.' });
        const rows = readBonuses(), employeeId = String(data.employeeId);
        const old = rows.find((item) => item.employeeId === employeeId && item.day === day);
        const time = new Date().toISOString();
        const record = { id: old?.id ?? randomBytes(16).toString('hex'), employeeId, name: String(data.name).trim().slice(0, 150), day, amount: Math.round(amount * 100) / 100, note: String(data.note ?? '').trim(), updatedAt: time, updatedBy: user.name, history: [...(old?.history ?? []), { amount: old?.amount ?? null, note: old?.note ?? '', changedAt: time, changedBy: user.id }] };
        const bonuses = [record, ...rows.filter((item) => item.id !== record.id)];
        mkdirSync(directory, { recursive: true });
        writeFileSync(bonusesFile + '.tmp', JSON.stringify(bonuses), { mode: 0o600 }); renameSync(bonusesFile + '.tmp', bonusesFile);
        return send(200, { bonuses });
      }
      if (['/api/auth/attendance', '/api/auth/attendance/update', '/api/auth/attendance/cancel', '/api/auth/attendance/schedule'].includes(path)) {
        const operation = path === '/api/auth/attendance' ? 'record' : path.split('/').at(-1);
        try { const result = attendance.mutate(user, data, operation); return send(result.status, result.body); }
        catch { return send(503, { error: 'Davomatni serverda saqlab bo‘lmadi. Qayta urinib ko‘ring.' }); }
      }
      if (path === '/api/auth/users/delete') {
        if (user?.role !== 'admin') return send(403, { error: 'Ruxsat yo‘q.' });
        const target = users.find((item) => item.id === data.id && ['worker', 'cashier'].includes(item.role));
        if (!target) return send(404, { error: 'Ishchi yoki kassir akkaunti topilmadi.' });
        persist(users.filter((item) => item.id !== target.id));
        for (const [key, value] of sessions) if (value.id === target.id) sessions.delete(key);
        return send(200, { ok: true });
      }
      if (path === '/api/auth/users/update') {
        if (user?.role !== 'admin') return send(403, { error: 'Ruxsat yo‘q.' });
        const target = users.find((item) => item.id === data.id && ['worker', 'cashier'].includes(item.role));
        if (!target) return send(404, { error: 'Ishchi yoki kassir akkaunti topilmadi.' });
        const login = String(data.login ?? '').trim().toLowerCase();
        const name = String(data.name ?? '').trim();
        if (!/^[a-z0-9_.-]{3,40}$/.test(login) || !name || name.length > 100 || !['worker', 'cashier'].includes(data.role) || (data.password !== undefined && data.password !== '' && (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128))) return send(400, { error: 'Ism, login yoki yangi parol noto‘g‘ri.' });
        if (users.some((item) => item.id !== target.id && item.login === login)) return send(400, { error: 'Bu login band.' });
        const salt = data.password ? randomBytes(16).toString('hex') : target.salt;
        const updated = { ...target, login, name, role: data.role, employeeId: data.employeeId ? String(data.employeeId) : target.employeeId, salt, hash: data.password ? scryptSync(data.password, salt, 64).toString('hex') : target.hash };
        persist(users.map((item) => item.id === target.id ? updated : item));
        for (const [key, value] of sessions) if (value.id === target.id) sessions.delete(key);
        return send(200, { user: publicUser(updated) });
      }
      if (path === '/api/auth/profile') {
        if (!user) return send(401, { error: 'Tizimga kiring.' });
        const login = String(data.login ?? '').trim().toLowerCase();
        const name = String(data.name ?? '').trim();
        if (!/^[a-z0-9_.-]{3,40}$/.test(login) || !name || name.length > 100 || (data.password && (typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128))) return send(400, { error: 'Login, ism yoki parol noto‘g‘ri.' });
        if (users.some((item) => item.id !== user.id && item.login === login)) return send(400, { error: 'Login band.' });
        if ((login !== user.login || data.password) && !timingSafeEqual(scryptSync(String(data.current ?? ''), user.salt, 64), Buffer.from(user.hash, 'hex'))) return send(403, { error: 'Joriy parol noto‘g‘ri.' });
        const salt = data.password ? randomBytes(16).toString('hex') : user.salt;
        const updated = { ...user, name, login, salt, hash: data.password ? scryptSync(data.password, salt, 64).toString('hex') : user.hash };
        persist(users.map((item) => item.id === user.id ? updated : item));
        if (data.password || login !== user.login) for (const [key, value] of sessions) if (value.id === user.id && key !== token) sessions.delete(key);
        return send(200, { user: publicUser(updated) });
      }
      if (path === '/api/auth/role-login') {
        if (!['admin', 'cashier', 'worker'].includes(data.role)) return send(400, { error: 'Rolni tanlang.' });
        let found = users.find((item) => item.role === data.role);
        if (!found) {
          const salt = randomBytes(16).toString('hex');
          found = { id: randomBytes(16).toString('hex'), login: 'role-' + data.role + '-' + randomBytes(4).toString('hex'), name: { admin: 'Admin', cashier: 'Kassir', worker: 'Ishchi' }[data.role], role: data.role, salt, hash: scryptSync(randomBytes(32).toString('hex'), salt, 64).toString('hex') };
          persist([...users, found]);
        }
        for (const [key, value] of sessions) if (value.expires <= Date.now()) sessions.delete(key);
        sessions.delete(token);
        const created = randomBytes(32).toString('hex');
        sessions.set(created, { id: found.id, expires: Date.now() + 28800000 });
        res.setHeader('Set-Cookie', cookie(created, 28800));
        return send(200, { user: publicUser(found) });
      }
      if (path === '/api/auth/login') {
        const ip = req.socket.remoteAddress;
        const previous = attempts.get(ip);
        const attempt = previous?.until > Date.now() ? previous : { count: 0, until: Date.now() + 900000 };
        if (attempt.count >= 10) return send(429, { error: 'Urinishlar ko‘p. 15 daqiqadan keyin qayta urinib ko‘ring.' });
        const found = users.find((item) => item.login === data.login?.trim().toLowerCase());
        const hash = scryptSync(String(data.password ?? ''), found?.salt ?? 'invalid-login', 64);
        if (!found || !timingSafeEqual(hash, Buffer.from(found.hash, 'hex'))) {
          attempt.count++; attempts.set(ip, attempt); return send(401, { error: 'Login yoki parol noto‘g‘ri.' });
        }
        attempts.delete(ip);
        for (const [key, value] of sessions) if (value.expires <= Date.now()) sessions.delete(key);
        sessions.delete(token);
        const created = randomBytes(32).toString('hex'); sessions.set(created, { id: found.id, expires: Date.now() + 28800000 });
        res.setHeader('Set-Cookie', cookie(created, 28800)); return send(200, { user: publicUser(found) });
      }
      if (path !== '/api/auth/setup' && path !== '/api/auth/users') return send(404, { error: 'Topilmadi.' });
      if (path === '/api/auth/setup' ? users.length !== 0 : user?.role !== 'admin') return send(403, { error: 'Ruxsat yo‘q.' });
      const login = String(data.login ?? '').trim().toLowerCase(), name = String(data.name ?? '').trim();
      const role = path === '/api/auth/setup' ? 'admin' : data.role;
      if (!/^[a-z0-9_.-]{3,40}$/.test(login) || !name || name.length > 100 || typeof data.password !== 'string' || data.password.length < 8 || data.password.length > 128 || !['admin', 'worker', 'cashier'].includes(role)) return send(400, { error: 'Ism, to‘g‘ri login va kamida 8 belgili parol kiriting.' });
      const existing = users.find((item) => item.login === login);
      if (existing && existing.role !== role) return send(400, { error: 'Bu login boshqa rol uchun band.' });
      const salt = randomBytes(16).toString('hex');
      const created = { id: existing?.id ?? randomBytes(16).toString('hex'), login, name, role, employeeId: data.employeeId ? String(data.employeeId) : existing?.employeeId, salt, hash: scryptSync(data.password, salt, 64).toString('hex') };
      persist([...users.filter((item) => item.id !== created.id), created]);
      for (const [key, value] of sessions) if (value.id === created.id) sessions.delete(key);
      return send(200, { ok: true });
    } catch { return send(400, { error: 'So‘rovni saqlab bo‘lmadi. Qayta urinib ko‘ring.' }); }
  };
}
