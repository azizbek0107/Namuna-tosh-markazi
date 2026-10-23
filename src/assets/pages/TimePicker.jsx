import { useEffect, useId, useRef, useState } from "react";
import { Check, Clock3, X } from "lucide-react";
import TimeWheel from "./TimeWheel.jsx";

const twoDigits = (number) => String(number).padStart(2, "0");

function initialTime(value) {
  if (/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    const [hours, minutes] = value.split(":").map(Number);
    return { hours, minutes };
  }
  const tashkent = new Date().toLocaleTimeString("en-GB", { timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", hour12: false });
  const [hours, minutes] = tashkent.split(":").map(Number);
  return { hours, minutes };
}

function positionPicker(trigger, picker) {
  if (!trigger || !picker) return;
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(240, window.innerWidth - 16);
  const height = picker.offsetHeight || 200;
  const below = window.innerHeight - rect.bottom - 8;
  const top = below >= height || below >= rect.top ? rect.bottom + 8 : rect.top - height - 8;
  picker.style.width = `${width}px`;
  picker.style.left = `${Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8))}px`;
  picker.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
}

export default function TimePicker({ value, onChange, disabled = false, active = true }) {
  const id = useId();
  const trigger = useRef(null);
  const picker = useRef(null);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState({ hours: 0, minutes: 0 });

  useEffect(() => {
    if (disabled || !active) picker.current?.hidePopover();
  }, [disabled, active]);

  useEffect(() => {
    if (!open) return;
    picker.current?.querySelector('[role="spinbutton"]')?.focus({ preventScroll: true });
    let frame;
    function reposition() {
      positionPicker(trigger.current, picker.current);
      frame = requestAnimationFrame(reposition);
    }
    frame = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function close(restoreFocus = false) {
    picker.current?.hidePopover();
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  return <>
    <button ref={trigger} type="button" className="sales-delivery-time-trigger" disabled={disabled} popoverTarget={`${id}-picker`} aria-label="Vaqtni aylantirib tanlash" aria-haspopup="dialog" aria-expanded={open} aria-controls={`${id}-picker`}>
      <Clock3 size={16} aria-hidden="true" />
    </button>
    <div ref={picker} id={`${id}-picker`} className="sales-time-picker" popover="auto" role="dialog" aria-labelledby={`${id}-title`} onBeforeToggle={(event) => {
      if (event.newState !== "open") return;
      setSelected(initialTime(value));
      positionPicker(trigger.current, picker.current);
    }} onToggle={(event) => setOpen(event.newState === "open")} onKeyDown={(event) => {
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
    }}>
      <div className="sales-time-picker-heading"><span id={`${id}-title`}>Vaqtni tanlash</span><button type="button" aria-label="Vaqt tanlashni yopish" onClick={() => close(true)}><X size={14} aria-hidden="true" /></button></div>
      <div className="sales-time-picker-wheels">{open && <>
        <TimeWheel label="Soat" count={24} value={selected.hours} onChange={(hours) => setSelected((current) => ({ ...current, hours }))} />
        <span className="sales-time-picker-colon" aria-hidden="true">:</span>
        <TimeWheel label="Daqiqa" count={60} value={selected.minutes} onChange={(minutes) => setSelected((current) => ({ ...current, minutes }))} />
      </>}</div>
      <button type="button" className="sales-time-picker-confirm" onClick={() => {
        onChange(`${twoDigits(selected.hours)}:${twoDigits(selected.minutes)}`);
        close(true);
      }}><Check size={14} aria-hidden="true" />Tanlash</button>
    </div>
  </>;
}
