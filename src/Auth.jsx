import { useCallback, useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import './Auth.css';
import { authRequest, roleNames } from './authApi.js';

export function AuthGate({ children }) {
  const [state, setState] = useState(null), [error, setError] = useState(''), [busy, setBusy] = useState(false);
  const refresh = useCallback(() => authRequest('session').then(setState).catch(() => setError('Serverga ulanib bo‘lmadi. Sahifani yangilang.')), []);
  const signedIn = Boolean(state?.user);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!signedIn) return;
    const timer = setInterval(refresh, 60000);
    window.addEventListener('focus', refresh);
    return () => { clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [signedIn, refresh]);
  async function submit(data) {
    setBusy(true); setError('');
    try {
      const result = await authRequest('role-login', data); setState({ setup: false, user: result.user });
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  if (state?.user) return children(state.user, async () => {
    try { await authRequest('logout', {}); setState({ setup: false, user: null }); setError(''); }
    catch { window.alert('Chiqish bajarilmadi. Qayta urinib ko‘ring.'); }
  });
  return <main className="auth-screen"><section className="auth-card"><div className="auth-brand"><img src="/ntm-logo.png" alt="NTM logotipi" width="96" height="96" /></div><h1>Tizimga kirish</h1>{state ? <div className="auth-form">{["admin", "cashier", "worker"].map((role) => <button key={role} type="button" className="auth-submit" disabled={busy} onClick={() => submit({ role })}>{roleNames[role]}</button>)}</div> : <p>Ulanmoqda...</p>}{error && <p className="auth-error" role="alert">{error}</p>}</section></main>;
}

export function UserAccess({ employees = [] }) {
  const [users, setUsers] = useState([]), [message, setMessage] = useState(''), [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null), [showPassword, setShowPassword] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);
  useEffect(() => { authRequest('users').then((data) => setUsers(data.users)).catch((err) => setMessage(err.message)); }, []);
  function edit(user) {
    setEditing(user); setShowPassword(false); setMessage(''); setShowForm(true);
    requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
  async function deleteAccount(user) {
    if (busy || !window.confirm(`${user.name} akkaunti o‘chirilsinmi? Xodim va savdo tarixi saqlanadi.`)) return;
    setBusy(true); setMessage('');
    try {
      await authRequest('users/delete', { id: user.id });
      setUsers((current) => current.filter((item) => item.id !== user.id));
      if (editing?.id === user.id) { setEditing(null); setShowPassword(false); }
      setMessage('Akkaunt o‘chirildi.');
    } catch (err) { setMessage(err.message); } finally { setBusy(false); }
  }
  return <section className="panel access-panel"><div className="access-panel-heading"><h2>Ishchi va kassir akkauntlari</h2><button type="button" className="auth-submit" disabled={busy} aria-expanded={showForm && !editing} aria-controls="access-account-form" onClick={() => { setEditing(null); setShowPassword(false); setMessage(''); setShowForm(true); }}>Yangi akkaunt qo‘shish</button></div>
    <p>Loginlarni ko'ring va tahrirlang. Joriy parollar xesh ko'rinishida saqlanadi va ko'rsatilmaydi. Yangi parol belgilashingiz mumkin.</p>
    <div className="warehouse-table-wrapper"><table className="warehouse-table"><thead><tr><th>Ism</th><th>Rol</th><th>Login</th><th>Parol</th><th>Amal</th></tr></thead><tbody>
      {users.filter((user) => user.role !== 'admin').map((user) => <tr key={user.id}><td>{user.name}</td><td>{roleNames[user.role]}</td><td>{user.login}</td><td>Yashirilgan</td><td><div className="warehouse-actions"><button type="button" disabled={busy} className="text-button" title="Login / parolni tahrirlash" aria-label={`${user.name}: login / parolni tahrirlash`} onClick={() => edit(user)}><Pencil size={18} aria-hidden="true" /></button><button type="button" disabled={busy} className="warehouse-delete-btn" title="Akkauntni o‘chirish" aria-label={`${user.name}: akkauntni o‘chirish`} onClick={() => deleteAccount(user)}><Trash2 size={18} aria-hidden="true" /></button></div></td></tr>)}
      {!users.some((user) => user.role !== 'admin') && <tr><td colSpan={5}>Hali ishchi yoki kassir akkaunti yo'q.</td></tr>}
    </tbody></table></div>
    {showForm && <div id="access-account-form">
    <h3>{editing ? editing.name + " ' tahrirlash" : 'Yangi akkaunt'}</h3>
    <form ref={formRef} key={editing?.id ?? 'new'} className="auth-form" onSubmit={async (event) => {
      event.preventDefault(); if (busy) return;
      const form = event.currentTarget, data = Object.fromEntries(new FormData(form));
      const employee = employees.find((item) => String(item.id) === data.employeeId);
      if (!employee) { setMessage('Xodimlar ro‘yxatidan xodimni tanlang.'); return; }
      data.name = employee.name;
      setBusy(true); setMessage('');
      try {
        await authRequest(editing ? 'users/update' : 'users', editing ? { ...data, id: editing.id } : data);
        const result = await authRequest('users'); setUsers(result.users); form.reset(); setEditing(null); setShowPassword(false); setShowForm(false);
        setMessage('Akkaunt saqlandi. O\'zgartirilgan xodim qayta tizimga kirishi kerak.');
      } catch (err) { setMessage(err.message); } finally { setBusy(false); }
    }}>
      <label>Xodim<select required name="employeeId" defaultValue={editing?.employeeId ?? employees.find((item) => item.name === editing?.name)?.id ?? ''}>
        <option value="">Xodimni tanlang</option>
        {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name} — {employee.role}</option>)}
      </select></label>
      {employees.length === 0 && <p role="status">Avval Xodimlar bo‘limida xodim qo‘shing.</p>}
      <label>Rol<select name="role" defaultValue={editing?.role ?? 'worker'}><option value="worker">Ishchi</option><option value="cashier">Kassir</option></select></label>
      <label>Login<input required name="login" minLength={3} maxLength={40} pattern="[a-zA-Z0-9_.-]{3,40}" autoComplete="off" autoCapitalize="none" defaultValue={editing?.login ?? ''} /></label>
      <div className="auth-password-field">
        <label htmlFor="access-password">{editing ? 'Yangi parol (bo‘sh qolsa eski parol saqlanadi)' : 'Parol'}</label>
        <div className="auth-password">
          <input id="access-password" required={!editing} name="password" type={showPassword ? 'text' : 'password'} minLength={8} maxLength={128} autoComplete="new-password" />
          <button type="button" aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'} title={showPassword ? 'Parolni yashirish' : 'Parolni ko‘rsatish'} aria-controls="access-password" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}</button>
        </div>
      </div>
      <button disabled={busy} className="auth-submit">{busy ? 'Saqlanmoqda...' : editing ? 'O\'zgarishlarni saqlash' : 'Akkaunt yaratish'}</button>
      <button type="button" className="text-button" disabled={busy} onClick={() => { setEditing(null); setShowPassword(false); setShowForm(false); setMessage(''); }}>Bekor qilish</button>
    </form></div>}{message && <p role="status">{message}</p>}
  </section>;
}
