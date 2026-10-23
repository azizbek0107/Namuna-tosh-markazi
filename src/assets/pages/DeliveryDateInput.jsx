import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatUzDateInput, parseUzDate } from "../../uzbekDate.js";
import { dateDigitsFromDisplay, editDateDigits } from "../../dateInputEditing.js";

function changedRange(before, after) {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) start += 1;
  let end = before.length;
  let afterEnd = after.length;
  while (end > start && afterEnd > start && before[end - 1] === after[afterEnd - 1]) { end -= 1; afterEnd -= 1; }
  return { start, end, text: after.slice(start, afterEnd) };
}

export default function DeliveryDateInput({ value, onChange, min, max = "2099-12-31", label = "Yetkazib berish sanasi", disabled = false, invalid = false, describedBy }) {
  const id = useId();
  const input = useRef(null);
  const calendar = useRef(null);
  const pendingEdit = useRef(null);
  const [digits, setDigits] = useState(() => dateDigitsFromDisplay(value) ?? "");
  const displayed = formatUzDateInput(digits);
  const complete = digits.length === 6;
  const date = parseUzDate(displayed);
  const error = complete && !date ? "Sanani to‘g‘ri kiriting, masalan: 25-10-2026." : date && date < min ? "Yetkazib berish sanasi bugungi kundan oldin bo‘lishi mumkin emas." : "";
  const validationProps = { "aria-invalid": Boolean(error) || invalid || undefined, "aria-describedby": invalid ? describedBy : undefined };

  const commit = useCallback((edit) => {
    if (!edit) return;
    const formatted = formatUzDateInput(edit.digits);
    setDigits(edit.digits);
    onChange(parseUzDate(formatted));
    requestAnimationFrame(() => {
      if (document.activeElement !== input.current) return;
      const caret = Math.min(edit.caret, formatted.length);
      input.current?.setSelectionRange(caret, caret);
    });
  }, [onChange]);

  useLayoutEffect(() => { input.current?.setCustomValidity(error); }, [error]);
  useLayoutEffect(() => {
    const field = input.current;
    if (!field) return;
    function beforeInput(event) {
      const selection = { start: field.selectionStart ?? 0, end: field.selectionEnd ?? 0 };
      pendingEdit.current = { ...selection, type: event.inputType };
      if (!event.cancelable || event.isComposing) return;
      let edit;
      if (event.inputType.startsWith("delete")) {
        edit = editDateDigits(digits, { ...selection, direction: event.inputType.includes("Backward") ? "backward" : "forward" });
      } else if (event.inputType.startsWith("insert") && typeof event.data === "string") {
        const fullDate = dateDigitsFromDisplay(event.data);
        edit = fullDate === null ? editDateDigits(digits, { ...selection, text: event.data }) : { digits: fullDate, caret: 10 };
      } else return;
      event.preventDefault();
      pendingEdit.current = null;
      commit(edit);
    }
    field.addEventListener("beforeinput", beforeInput);
    return () => field.removeEventListener("beforeinput", beforeInput);
  }, [digits, commit]);

  function changeDate(event) {
    const pending = pendingEdit.current;
    pendingEdit.current = null;
    if (pending?.type.startsWith("delete")) {
      commit(editDateDigits(digits, { start: pending.start, end: pending.end, direction: pending.type.includes("Backward") ? "backward" : "forward" }));
      return;
    }
    const fullDate = dateDigitsFromDisplay(event.target.value);
    commit(fullDate === null ? editDateDigits(digits, changedRange(displayed, event.target.value)) : { digits: fullDate, caret: 10 });
  }

  function deleteDate(event) {
    if (!["Backspace", "Delete"].includes(event.key) || event.altKey) return;
    event.preventDefault();
    pendingEdit.current = null;
    let start = event.currentTarget.selectionStart ?? 0;
    let end = event.currentTarget.selectionEnd ?? start;
    if (start === end && (event.ctrlKey || event.metaKey)) {
      if (event.key === "Backspace") start = 0;
      else end = displayed.length;
    }
    commit(editDateDigits(digits, { start, end, direction: event.key === "Backspace" ? "backward" : "forward" }));
  }

  function pasteDate(event) {
    event.preventDefault();
    pendingEdit.current = null;
    const text = event.clipboardData.getData("text").trim();
    const fullDate = dateDigitsFromDisplay(text);
    const selection = { start: event.currentTarget.selectionStart ?? 0, end: event.currentTarget.selectionEnd ?? 0 };
    commit(fullDate === null ? editDateDigits(digits, { ...selection, text }) : { digits: fullDate, caret: 10 });
  }

  function focusEnd() {
    input.current?.focus({ preventScroll: true });
    input.current?.setSelectionRange(displayed.length, displayed.length);
  }


  return <div className="sales-delivery-date-field">
    <label htmlFor={id}>{label}</label>
    <div className="sales-delivery-date-control" data-complete={complete && Boolean(date) && !error && !invalid || undefined} data-invalid={Boolean(error) || invalid || undefined} role="group" aria-label={label} {...validationProps} onPointerDown={(event) => {
      if (disabled || event.button !== 0 || event.target !== event.currentTarget) return;
      event.preventDefault();
      focusEnd();
    }}>
      <input ref={input} id={id} className="sales-delivery-date-input" type="text" inputMode="numeric" required maxLength={10} pattern="[0-9]{2}-[0-9]{2}-20[0-9]{2}" placeholder="kk-oo-20yy" title="Kun-oy-yil. Yil 20 bilan boshlanadi, oxirgi ikki raqamini kiriting." {...validationProps} autoComplete="off" disabled={disabled} value={displayed} onChange={changeDate} onKeyDown={deleteDate} onPaste={pasteDate} />
      <button type="button" aria-label="Yetkazib berish sanasini kalendardan tanlash" disabled={disabled} onClick={() => {
        if (calendar.current?.showPicker) calendar.current.showPicker();
        else focusEnd();
      }}><CalendarDays size={16} aria-hidden="true" /></button>
      {/* The calendar is auxiliary; only the visible field validates the form. */}
      <input ref={calendar} className="sales-delivery-date-picker" type="date" form={`${id}-calendar`} min={min} max={max} tabIndex={-1} aria-hidden="true" disabled={disabled} value={value} onChange={(event) => {
        pendingEdit.current = null;
        const selected = dateDigitsFromDisplay(event.target.value) ?? "";
        commit({ digits: selected, caret: 10 });
        input.current?.focus({ preventScroll: true });
      }} />
    </div>
  </div>;
}
