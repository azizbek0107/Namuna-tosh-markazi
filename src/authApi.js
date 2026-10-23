export const roleNames = { admin: 'Administrator', worker: 'Ishchi', cashier: 'Kassir' };
export async function authRequest(path, data) {
  const response = await fetch(`/api/auth/${path}`, { credentials: 'same-origin', ...(data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : {}) });
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) throw new Error('Login API topilmadi. Serverning deploy sozlamalarini tekshiring.');
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'So‘rov bajarilmadi.');
  return result;
}
