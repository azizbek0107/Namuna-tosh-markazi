import { useId, useLayoutEffect, useRef } from "react";
import { formatUzTimeInput, getTimeRangeError } from "../../uzbekDate.js";
import TimePicker from "./TimePicker.jsx";

export default function DeliveryTimeInput({ value, onChange, disabled = false, error = "", describedBy, active = true, confirmed = false }) {
  const id = useId();
  const input = useRef(null);
  const selectionWasRange = useRef(false);
  const displayed = formatUzTimeInput(value) ?? "";
  const digits = displayed.replace(":", "");
  const ownError = getTimeRangeError(displayed);
  const validationError = ownError || error;
  const validationProps = { "aria-invalid": Boolean(validationError) || undefined, "aria-describedby": error ? describedBy : undefined };

  useLayoutEffect(() => { input.current?.setCustomValidity(validationError); }, [validationError]);
  useLayoutEffect(() => {
    const field = input.current;
    if (!field) return;
    const rememberSelection = () => { selectionWasRange.current = field.selectionStart !== field.selectionEnd; };
    field.addEventListener("beforeinput", rememberSelection);
    return () => field.removeEventListener("beforeinput", rememberSelection);
  }, []);

  function commit(nextDigits, digitCaret) {
    const formatted = formatUzTimeInput(nextDigits);
    if (formatted === null) return;
    onChange(formatted);
    requestAnimationFrame(() => {
      if (document.activeElement !== input.current) return;
      const caret = Math.min(formatted.length, digitCaret + (digitCaret >= 2 ? 1 : 0));
      input.current?.setSelectionRange(caret, caret);
    });
  }

  function changeTime(event) {
    const raw = event.target.value;
    const rangeDeletion = selectionWasRange.current;
    selectionWasRange.current = false;
    if (!/^[0-9:]*$/.test(raw) || (raw.match(/:/g)?.length ?? 0) > 1) return;
    const caret = event.target.selectionStart ?? raw.length;
    const inputType = event.nativeEvent.inputType;
    // Mobile deletion of the separator should remove the adjacent digit too.
    if (!rangeDeletion && displayed.includes(":") && raw === digits && caret === 2) {
      if (inputType === "deleteContentBackward") { commit(digits.slice(0, 1) + digits.slice(2), 1); return; }
      if (inputType === "deleteContentForward") { commit(digits.slice(0, 2) + digits.slice(3), 2); return; }
    }
    commit(raw.replace(":", ""), raw.slice(0, caret).replace(":", "").length);
  }

  function pasteTime(event) {
    event.preventDefault();
    const pasted = formatUzTimeInput(event.clipboardData.getData("text").trim());
    if (pasted === null) return;
    const pastedDigits = pasted.replace(":", "");
    if (pastedDigits.length === 4) { commit(pastedDigits, 4); return; }
    const start = displayed.slice(0, event.currentTarget.selectionStart ?? 0).replace(":", "").length;
    const end = displayed.slice(0, event.currentTarget.selectionEnd ?? 0).replace(":", "").length;
    commit(digits.slice(0, start) + pastedDigits + digits.slice(end), start + pastedDigits.length);
  }

  function deleteAtSeparator(event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.currentTarget.selectionStart !== event.currentTarget.selectionEnd || !displayed.includes(":")) return;
    const caret = event.currentTarget.selectionStart;
    if (event.key === "Backspace" && caret === 3) {
      event.preventDefault();
      commit(digits.slice(0, 1) + digits.slice(2), 1);
    } else if (event.key === "Delete" && caret === 2) {
      event.preventDefault();
      commit(digits.slice(0, 2) + digits.slice(3), 2);
    }
  }

  return <div className="sales-delivery-time-field">
    <label htmlFor={id}>Yetkazib berish vaqti (Toshkent)</label>
    <div className="sales-delivery-time-control" data-complete={confirmed && !validationError || undefined} data-invalid={Boolean(validationError) || undefined} role="group" aria-label="Yetkazib berish vaqti, Toshkent" {...validationProps} onPointerDown={(event) => {
      if (disabled || event.button !== 0 || event.target !== event.currentTarget) return;
      event.preventDefault();
      input.current?.focus({ preventScroll: true });
      input.current?.setSelectionRange(displayed.length, displayed.length);
    }}>
      <input ref={input} id={id} className="sales-delivery-time-input" type="text" inputMode="numeric" required maxLength={5} pattern="([01][0-9]|2[0-3]):[0-5][0-9]" placeholder="00:00" title="Soat 00–23, daqiqa 00–59. Masalan: 1430 → 14:30" {...validationProps} autoComplete="off" disabled={disabled} value={displayed} onChange={changeTime} onPaste={pasteTime} onKeyDown={deleteAtSeparator} />
      <TimePicker value={displayed} onChange={onChange} disabled={disabled} active={active} />
    </div>
  </div>;
}
