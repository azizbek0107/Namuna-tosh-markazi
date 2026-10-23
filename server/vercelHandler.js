import { Readable } from 'node:stream';
import { authMiddleware } from './auth.js';
import { snapshotJsonStore } from './jsonStore.js';
import { redisState } from './redisState.js';
import { revenueAiMiddleware } from './revenueAi.js';

export function createVercelHandler(env = process.env, request = fetch) {
  const revenue = revenueAiMiddleware(env, request);
  return async (req, res) => {
    const send = (status, error) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ error }));
    };
    try {
      const route = req.query?.route;
      const url = route ? `/api/${Array.isArray(route) ? route.join('/') : route}` : req.url;
      let body = '';
      if (!['GET', 'HEAD'].includes(req.method)) {
        if (req.body !== undefined) body = typeof req.body === 'string' ? req.body : Buffer.isBuffer(req.body) ? req.body.toString() : JSON.stringify(req.body);
        else for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 32000) return send(413, 'So‘rov juda katta.');
        }
        if (Buffer.byteLength(body) > 32000) return send(413, 'So‘rov juda katta.');
      }
      const replay = () => Object.assign(Readable.from(body ? [body] : []), {
        url, method: req.method, headers: req.headers,
        socket: { remoteAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress },
      });
      const state = redisState(env, request);
      const result = await state.transact(async (documents) => {
        const output = { status: 200, headers: {}, body: '', next: false };
        const captured = {
          setHeader(name, value) { output.headers[name] = value; },
          writeHead(status, headers) { output.status = status; Object.assign(output.headers, headers); },
          end(value) { output.body = value || ''; },
        };
        await authMiddleware({ secure: true, storage: snapshotJsonStore(documents), sharedSessions: true })(replay(), captured, () => { output.next = true; });
        return output;
      });
      if (result.next) return revenue(replay(), res, () => send(404, 'API topilmadi.'));
      res.writeHead(result.status, result.headers);
      res.end(result.body);
    } catch (error) {
      return send(503, error.message === 'STORAGE_NOT_CONFIGURED'
        ? 'Server bazasi ulanmagan. Vercel Storage orqali Upstash Redis bazasini ulang va qayta deploy qiling.'
        : 'Server bazasiga ulanib bo‘lmadi. Birozdan keyin qayta urinib ko‘ring.');
    }
  };
}
