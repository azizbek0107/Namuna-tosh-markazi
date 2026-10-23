import { useRef, useState } from "react";
import { Camera, Eye, EyeOff } from "lucide-react";
import { authRequest } from "../../authApi.js";

async function passwordHash(password, salt) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt: new Uint8Array(salt), iterations: 600000, hash: "SHA-256" }, key, 256);
  return Array.from(new Uint8Array(bits)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export default function AccountSettings({ account, name, onSave }) {
  const dialog = useRef(null);
  const photoInput = useRef(null);
  const [form, setForm] = useState({ name, login: account.login || "", avatar: account.avatar || "", current: "", password: "", confirm: "" });
  const [message, setMessage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const update = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setMessage(null); };

  async function chooseImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setMessage({ error: true, text: "JPG, PNG yoki WebP rasm tanlang (2 MB gacha)." }); return;
    }
    setReadingImage(true);
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const size = Math.min(bitmap.width, bitmap.height);
      canvas.getContext("2d").drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 256, 256);
      bitmap.close();
      update("avatar", canvas.toDataURL("image/webp", 0.85));
    } catch { setMessage({ error: true, text: "Rasmni o‘qib bo‘lmadi. Boshqa rasm tanlang." }); }
    finally { setReadingImage(false); }
  }

  async function save(event) {
    event.preventDefault();
    setMessage(null);
    if (!form.name.trim() || !/^[a-zA-Z0-9_.-]{3,40}$/.test(form.login.trim())) {
      setMessage({ error: true, text: "Ismingizni kiriting. Login 3–40 ta lotin harfi, raqam, nuqta, tire yoki pastki chiziqdan iborat bo‘lsin." }); return;
    }
    if (form.password && (form.password.length < 8 || form.password !== form.confirm)) {
      setMessage({ error: true, text: "Yangi parol kamida 8 belgidan iborat bo‘lsin va tasdiqlash bilan mos kelsin." }); return;
    }
    if (!form.password && form.confirm) { setMessage({ error: true, text: "Yangi parolni ham kiriting." }); return; }
    setBusy(true);
    try {
      const next = { ...account, login: form.login.trim(), avatar: form.avatar };
      if (!account.serverAuth && account.passwordHash && (form.password || next.login !== account.login)) {
        if (await passwordHash(form.current, account.salt) !== account.passwordHash) {
          setMessage({ error: true, text: "Joriy parol noto‘g‘ri." }); return;
        }
      }
      if (account.serverAuth) {
        await authRequest("profile", { name: form.name.trim(), login: next.login, current: form.current, password: form.password });
        delete next.passwordHash;
        delete next.salt;
      } else if (form.password) {
        next.salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
        next.passwordHash = await passwordHash(form.password, next.salt);
      }
      localStorage.setItem("stonex-account", JSON.stringify(next));
      onSave(next, form.name.trim());
      setForm((current) => ({ ...current, current: "", password: "", confirm: "" }));
      setVisiblePasswords({});
      setMessage({ text: "Akkaunt sozlamalari saqlandi." });
    } catch (error) { setMessage({ error: true, text: error.message || "Saqlab bo‘lmadi. Qayta urinib ko‘ring." }); }
    finally { setBusy(false); }
  }

  return <>
    <button type="button" className="topbar-avatar account-trigger" aria-label="Akkaunt sozlamalari" title="Akkaunt sozlamalari" aria-haspopup="dialog" onClick={() => {
      setForm({ name, login: account.login || "", avatar: account.avatar || "", current: "", password: "", confirm: "" });
      setVisiblePasswords({});
      setMessage(null); dialog.current.showModal();
    }}>{account.avatar ? <img src={account.avatar} alt="" /> : name.slice(0, 1).toUpperCase()}</button>
    <dialog ref={dialog} className="account-dialog" aria-labelledby="account-title">
      <div className="popover-heading"><h2 id="account-title">Akkaunt sozlamalari</h2><button type="button" disabled={busy || readingImage} onClick={() => dialog.current.close()}>Yopish</button></div>
      <p className="account-note">Login va parol serverda saqlanadi. Profil rasmi shu brauzerda saqlanadi.</p>
      <form className="account-form" onSubmit={save}>
        <fieldset disabled={busy || readingImage}>
          <div className="account-photo">
            <div className="account-photo-control">
              <span className="account-preview">{form.avatar ? <img src={form.avatar} alt="Profil rasmi" /> : form.name.slice(0, 1).toUpperCase()}</span>
              <button type="button" className="account-camera" aria-label="Profil rasmini tanlash" title="Profil rasmini tanlash" onClick={() => photoInput.current.click()}><Camera size={18} aria-hidden="true" /></button>
            </div>
            <input ref={photoInput} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseImage} />
            {form.avatar && <button type="button" className="text-button" onClick={() => update("avatar", "")}>Rasmni olib tashlash</button>}
          </div>
          <label>Ismingiz<input autoComplete="name" required maxLength={100} value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
          <label>Login<input autoComplete="username" required minLength={3} maxLength={40} value={form.login} onChange={(e) => update("login", e.target.value)} /></label>
          {[
            ...(account.passwordHash || account.serverAuth ? [{ key: "current", label: "Joriy parol", autoComplete: "current-password" }] : []),
            { key: "password", label: "Yangi parol", autoComplete: "new-password", minLength: 8, placeholder: "O‘zgartirish uchun kiriting" },
            { key: "confirm", label: "Yangi parolni tasdiqlang", autoComplete: "new-password" },
          ].map(({ key, label, ...inputProps }) => (
            <div className="account-password-field" key={key}>
              <label htmlFor={`account-${key}`}>{label}</label>
              <div className="account-password-input">
                <input {...inputProps} id={`account-${key}`} type={visiblePasswords[key] ? "text" : "password"} value={form[key]} onChange={(e) => update(key, e.target.value)} />
                <button type="button" className="account-password-toggle" aria-label={`${label}: ${visiblePasswords[key] ? "yashirish" : "ko‘rsatish"}`} title={visiblePasswords[key] ? "Parolni yashirish" : "Parolni ko‘rsatish"} aria-controls={`account-${key}`} onClick={() => setVisiblePasswords((current) => ({ ...current, [key]: !current[key] }))}>
                  {visiblePasswords[key] ? <EyeOff size={19} aria-hidden="true" /> : <Eye size={19} aria-hidden="true" />}
                </button>
              </div>
            </div>
          ))}
          <button className="warehouse-add-btn" type="submit">{busy ? "Saqlanmoqda…" : "Saqlash"}</button>
        </fieldset>
        {message && <p role={message.error ? "alert" : "status"} className={message.error ? "sales-error" : "account-note"}>{message.text}</p>}
      </form>
    </dialog>
  </>;
}
