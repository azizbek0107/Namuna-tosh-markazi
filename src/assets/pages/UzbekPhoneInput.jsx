import { useLayoutEffect, useRef } from "react";
import { formatUzPhone, normalizeUzPhone, uzPhoneDigits } from "../../uzbekPhone.js";

const digitCount = (text) => text.replace(/\D/g, "").length;
function caretOffset(text, digits) {
  if (digits <= 0) return 0;
  let count = 0;
  for (let index = 0; index < text.length; index++) {
    if (/\d/.test(text[index]) && ++count === digits) return index + 1;
  }
  return text.length;
}

function UzbekistanFlag() {
  const stars = [[14, 1.5], [17, 1.5], [20, 1.5], [11, 3.5], [14, 3.5], [17, 3.5], [20, 3.5], [8, 5.5], [11, 5.5], [14, 5.5], [17, 5.5], [20, 5.5]];
  return <svg className="sales-phone-flag" viewBox="0 0 30 20" aria-hidden="true">
    <path fill="#0099b5" d="M0 0h30v7H0z" /><path fill="#fff" d="M0 7h30v6H0z" /><path fill="#1eb53a" d="M0 13h30v7H0z" />
    <path fill="#ce1126" d="M0 6.4h30v.6H0zM0 13h30v.6H0z" /><circle cx="5" cy="3.5" r="2.4" fill="#fff" /><circle cx="6" cy="3.5" r="2" fill="#0099b5" />
    {stars.map(([x, y]) => <path key={`${x}-${y}`} transform={`translate(${x} ${y})`} fill="#fff" d="M0-.8.18-.25.76-.25.3.1.48.65 0 .32-.48.65-.3.1-.76-.25-.18-.25Z" />)}
  </svg>;
}

export default function UzbekPhoneInput({ label, value, onChange, disabled = false }) {
  const input = useRef(null);
  const pendingCaret = useRef(null);
  const digits = uzPhoneDigits(value).slice(0, 9);
  const formatted = formatUzPhone(value);
  const complete = normalizeUzPhone(value) !== null;

  useLayoutEffect(() => {
    if (pendingCaret.current === null || !input.current) return;
    const offset = caretOffset(formatted, pendingCaret.current);
    input.current.setSelectionRange(offset, offset);
    pendingCaret.current = null;
  }, [value, formatted]);

  useLayoutEffect(() => {
    const element = input.current;
    function deleteOnMobile(event) {
      if (!event.cancelable || !["deleteContentBackward", "deleteContentForward"].includes(event.inputType)) return;
      const { selectionStart, selectionEnd } = element;
      if (selectionStart !== selectionEnd || selectionStart === null) return;
      const beforeCaret = digitCount(formatted.slice(0, selectionStart));
      const index = event.inputType === "deleteContentBackward" ? beforeCaret - 1 : beforeCaret;
      if (index < 0 || index >= digits.length) return;
      event.preventDefault();
      const next = digits.slice(0, index) + digits.slice(index + 1);
      pendingCaret.current = index;
      onChange(next ? `+998${next}` : "");
    }
    element.addEventListener("beforeinput", deleteOnMobile);
    return () => element.removeEventListener("beforeinput", deleteOnMobile);
  }, [digits, formatted, onChange]);

  function update(next, caret) {
    const nextValue = next ? `+998${next}` : "";
    if (nextValue === value) {
      input.current.value = formatted;
      const offset = caretOffset(formatted, caret);
      input.current.setSelectionRange(offset, offset);
      pendingCaret.current = null;
      return;
    }
    pendingCaret.current = caret;
    onChange(nextValue);
  }

  return <label className="sales-phone-field">{label}
    <span className="sales-phone-control" data-complete={complete}>
      <UzbekistanFlag /><span className="sales-phone-prefix">+998</span>
      <input ref={input} type="tel" inputMode="numeric" autoComplete="tel-national" aria-label={`${label}, +998`} required pattern="[0-9]{2} [0-9]{3} [0-9]{2} [0-9]{2}" title="9 ta raqam kiriting: 90 123 45 56" placeholder="90 123 45 56" disabled={disabled} value={formatted} onChange={(event) => {
        const raw = event.target.value;
        if (!/^\+?[\d\s()-]*$/.test(raw)) return;
        if (raw.trim().startsWith("+") && !raw.replace(/\D/g, "").startsWith("998")) return;
        const national = uzPhoneDigits(raw);
        if (national.length > 9) return;
        const removedPrefix = digitCount(raw) - national.length;
        const beforeCaret = digitCount(raw.slice(0, event.target.selectionStart ?? raw.length)) - removedPrefix;
        const next = national;
        update(next, Math.max(0, Math.min(beforeCaret, next.length)));
      }} onKeyDown={(event) => {
        if (event.ctrlKey || event.metaKey || event.altKey || !["Backspace", "Delete"].includes(event.key)) return;
        const { selectionStart, selectionEnd } = event.currentTarget;
        if (selectionStart !== selectionEnd || selectionStart === null) return;
        const beforeCaret = digitCount(formatted.slice(0, selectionStart));
        const index = event.key === "Backspace" ? beforeCaret - 1 : beforeCaret;
        if (index < 0 || index >= digits.length) return;
        event.preventDefault();
        update(digits.slice(0, index) + digits.slice(index + 1), index);
      }} onPaste={(event) => {
        const text = event.clipboardData.getData("text").trim();
        const pastedDigits = text.replace(/\D/g, "");
        const normalized = normalizeUzPhone(text);
        if (normalized) { event.preventDefault(); update(uzPhoneDigits(normalized), 9); return; }
        if (!text.startsWith("+") && !(pastedDigits.length === 12 && pastedDigits.startsWith("998"))) return;
        event.preventDefault();
      }} />
    </span>
  </label>;
}
