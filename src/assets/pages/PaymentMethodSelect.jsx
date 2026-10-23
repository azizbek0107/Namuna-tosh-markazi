import { useEffect, useId, useRef, useState } from "react";
import { Banknote, CreditCard, HandCoins, Check, ChevronDown } from "lucide-react";

const options = [
  { value: "cash", label: "Naqd", icon: Banknote },
  { value: "card", label: "Karta", icon: CreditCard },
  { value: "debt", label: "Qarz", icon: HandCoins },
];

function positionMenu(trigger, menu) {
  if (!trigger || !menu) return;
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(rect.width, window.innerWidth - 16);
  const height = Math.min(menu.offsetHeight || 160, window.innerHeight - 16);
  const below = window.innerHeight - rect.bottom - 8;
  const top = below >= height || below >= rect.top ? rect.bottom + 6 : rect.top - height - 6;
  menu.style.width = `${width}px`;
  menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - width - 8))}px`;
  menu.style.top = `${Math.max(8, Math.min(top, window.innerHeight - height - 8))}px`;
}

export default function PaymentMethodSelect({ value, onChange, disabled = false, active = true }) {
  const id = useId();
  const trigger = useRef(null);
  const menu = useRef(null);
  const optionRefs = useRef([]);
  const [open, setOpen] = useState(false);
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
  const selected = options[selectedIndex];
  const SelectedIcon = selected.icon;

  useEffect(() => {
    if (!active || disabled) menu.current?.hidePopover();
  }, [active, disabled]);

  useEffect(() => {
    if (!open) return;
    let frame;
    function reposition() {
      positionMenu(trigger.current, menu.current);
      frame = requestAnimationFrame(reposition);
    }
    frame = requestAnimationFrame(reposition);
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function close(restoreFocus = false) {
    menu.current?.hidePopover();
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  function navigate(event) {
    const currentIndex = optionRefs.current.indexOf(document.activeElement);
    let next;
    if (event.key === "ArrowDown") next = (currentIndex + 1) % options.length;
    else if (event.key === "ArrowUp") next = (currentIndex - 1 + options.length) % options.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else if (event.key === "Escape") { event.preventDefault(); close(true); return; }
    else if (event.key === "Tab") { close(true); return; }
    else return;
    event.preventDefault();
    optionRefs.current[next]?.focus({ preventScroll: true });
  }

  return <div className="sales-payment-field">
    <label id={`${id}-label`} htmlFor={`${id}-trigger`}>To‘lov turi</label>
    <button ref={trigger} id={`${id}-trigger`} type="button" className="sales-payment-trigger" disabled={disabled} popoverTarget={`${id}-menu`} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${id}-menu`} aria-labelledby={`${id}-label ${id}-value`} onKeyDown={(event) => {
      if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (!menu.current.matches(":popover-open")) menu.current.showPopover();
      else optionRefs.current[selectedIndex]?.focus({ preventScroll: true });
    }}>
      <SelectedIcon size={18} aria-hidden="true" /><span id={`${id}-value`}>{selected.label}</span><ChevronDown className="sales-payment-chevron" size={16} aria-hidden="true" />
    </button>
    <div ref={menu} id={`${id}-menu`} className="sales-payment-menu" popover="auto" role="listbox" aria-labelledby={`${id}-label`} onKeyDown={navigate} onBeforeToggle={(event) => {
      if (event.newState === "open") positionMenu(trigger.current, menu.current);
    }} onToggle={(event) => {
      const isOpen = event.newState === "open";
      setOpen(isOpen);
      if (isOpen) optionRefs.current[selectedIndex]?.focus({ preventScroll: true });
    }}>
      {options.map(({ value: optionValue, label, icon: Icon }, index) => <button key={optionValue} ref={(node) => { optionRefs.current[index] = node; }} type="button" role="option" tabIndex={-1} aria-selected={value === optionValue} className="sales-payment-option" onClick={() => { onChange(optionValue); close(true); }}>
        <Icon size={18} aria-hidden="true" /><span>{label}</span>{value === optionValue && <Check className="sales-payment-check" size={16} aria-hidden="true" />}
      </button>)}
    </div>
  </div>;
}
