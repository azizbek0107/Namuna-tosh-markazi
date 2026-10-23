const compareAndSet = `
local current = redis.call('GET', KEYS[1]) or ''
if current ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2])
return 1`;

export function redisState(env, request = fetch) {
  const url = env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL;
  const token = env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('STORAGE_NOT_CONFIGURED');
  const key = env.REDIS_STATE_KEY || `ntm:server-state:${env.VERCEL_ENV || 'production'}`;
  async function command(args) {
    const response = await request(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('STORAGE_UNAVAILABLE');
    const data = await response.json();
    if (data.error) throw new Error('STORAGE_UNAVAILABLE');
    return data.result;
  }
  return {
    async transact(operation) {
      for (let attempt = 0; attempt < 5; attempt++) {
        const previous = await command(['GET', key]);
        const documents = previous === null ? {} : JSON.parse(previous);
        const result = await operation(documents);
        const updated = JSON.stringify(documents);
        if (updated === previous || (previous === null && updated === '{}')) return result;
        if (await command(['EVAL', compareAndSet, 1, key, previous ?? '', updated]) === 1) return result;
      }
      throw new Error('STORAGE_BUSY');
    },
  };
}
