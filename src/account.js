export function loadAccount() {
  try {
    const value = JSON.parse(localStorage.getItem("stonex-account") || "null");
    if (!value || typeof value !== "object" || Array.isArray(value)) return {};
    delete value.passwordHash;
    delete value.salt;
    localStorage.setItem("stonex-account", JSON.stringify(value));
    return value;
  } catch { return {}; }
}
