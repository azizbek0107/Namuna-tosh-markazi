import { useLayoutEffect, useRef, useState } from "react";

const ROW_HEIGHT = 32;
const wrap = (value, count) => ((value % count) + count) % count;
const twoDigits = (value) => String(value).padStart(2, "0");

export default function TimeWheel({ value, count, label, onChange }) {
  const [initialValue] = useState(() => wrap(value, count));
  const [position, setPosition] = useState(() => count + initialValue);
  const [selected, setSelected] = useState(initialValue);
  const [dragging, setDragging] = useState(false);
  const wheel = useRef(null);
  const positionRef = useRef(count + initialValue);
  const selectedRef = useRef(initialValue);
  const onChangeRef = useRef(onChange);
  const settleTimer = useRef(null);
  const pointer = useRef(null);
  const suppressClick = useRef(false);
  const clickTimer = useRef(null);

  useLayoutEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useLayoutEffect(() => {
    wheel.current.scrollTop = (count + initialValue) * ROW_HEIGHT;
    return () => {
      clearTimeout(settleTimer.current);
      clearTimeout(clickTimer.current);
      pointer.current = null;
    };
  }, [count, initialValue]);

  function updatePosition(nextPosition) {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
    const nextValue = wrap(Math.round(nextPosition), count);
    if (nextValue !== selectedRef.current) {
      selectedRef.current = nextValue;
      setSelected(nextValue);
      onChangeRef.current(nextValue);
    }
  }

  function settle() {
    clearTimeout(settleTimer.current);
    if (pointer.current?.dragging) return;
    const element = wheel.current;
    if (!element) return;
    let index = Math.round(element.scrollTop / ROW_HEIGHT);
    if (index < count || index >= count * 2) index = count + wrap(index, count);
    if (Math.abs(element.scrollTop - index * ROW_HEIGHT) > 0.5) {
      // Every copy has identical neighbours, so recentering keeps the wheel seamless.
      element.scrollTo({ top: index * ROW_HEIGHT, behavior: "instant" });
    }
    updatePosition(index);
  }

  function moveTo(index) {
    const element = wheel.current;
    if (!element) return;
    clearTimeout(settleTimer.current);
    const target = Math.max(0, Math.min(count * 3 - 1, index));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.scrollTo({ top: target * ROW_HEIGHT, behavior: reducedMotion ? "instant" : "smooth" });
  }

  function handleKeyDown(event) {
    const steps = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    let target;
    if (event.key in steps) {
      // Start keyboard moves from the middle copy, including around 00 and the maximum.
      const index = count + selectedRef.current;
      if (Math.abs(positionRef.current - index) >= count - 1) {
        wheel.current.scrollTo({ top: index * ROW_HEIGHT, behavior: "instant" });
        updatePosition(index);
      }
      target = Math.round(positionRef.current) + steps[event.key];
    } else if (event.key === "Home") target = count;
    else if (event.key === "End") target = count * 2 - 1;
    else return;
    event.preventDefault();
    moveTo(target);
  }

  function finishDrag(event) {
    const current = pointer.current;
    if (!current || current.id !== event.pointerId) return;
    pointer.current = null;
    if (event.currentTarget.hasPointerCapture(current.id)) event.currentTarget.releasePointerCapture(current.id);
    if (!current.dragging) return;
    delete event.currentTarget.dataset.dragging;
    setDragging(false);
    suppressClick.current = true;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { suppressClick.current = false; }, 250);
    settle();
  }

  return <div
    ref={wheel}
    className="sales-time-wheel"
    data-dragging={dragging || undefined}
    role="spinbutton"
    tabIndex={0}
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={count - 1}
    aria-valuenow={selected}
    aria-valuetext={twoDigits(selected)}
    onKeyDown={handleKeyDown}
    onPointerDown={(event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      event.preventDefault();
      clearTimeout(clickTimer.current);
      clearTimeout(settleTimer.current);
      suppressClick.current = false;
      event.currentTarget.focus({ preventScroll: true });
      pointer.current = { id: event.pointerId, y: event.clientY, top: event.currentTarget.scrollTop, dragging: false };
    }}
    onPointerMove={(event) => {
      const current = pointer.current;
      if (!current || current.id !== event.pointerId) return;
      const movement = event.clientY - current.y;
      if (!current.dragging) {
        if (Math.abs(movement) < 4) return;
        current.dragging = true;
        event.currentTarget.setPointerCapture(current.id);
        // Disable native snapping before this event changes scrollTop.
        event.currentTarget.dataset.dragging = "true";
        setDragging(true);
      }
      event.preventDefault();
      event.currentTarget.scrollTop = current.top - movement;
      updatePosition(event.currentTarget.scrollTop / ROW_HEIGHT);
    }}
    onPointerUp={finishDrag}
    onPointerCancel={finishDrag}
    onLostPointerCapture={finishDrag}
    onPointerLeave={() => { if (!pointer.current?.dragging) pointer.current = null; }}
    onScroll={(event) => {
      updatePosition(event.currentTarget.scrollTop / ROW_HEIGHT);
      clearTimeout(settleTimer.current);
      if (!pointer.current?.dragging) settleTimer.current = setTimeout(settle, 100);
    }}
    onScrollEnd={settle}
    onClick={(event) => {
      if (suppressClick.current) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick.current = false;
        return;
      }
      const option = event.target.closest("[data-wheel-index]");
      if (!option || !event.currentTarget.contains(option)) return;
      event.currentTarget.focus({ preventScroll: true });
      moveTo(Number(option.dataset.wheelIndex));
    }}
  >
    {Array.from({ length: count * 3 }, (_, index) => <div
      key={index}
      className="sales-time-wheel-option"
      aria-hidden="true"
      data-wheel-index={index}
      data-selected={index === Math.round(position) || undefined}
      data-distance={Math.abs(index - position)}
      style={{ "--wheel-distance": Math.max(-3, Math.min(3, index - position)), "--wheel-opacity": Math.max(0.15, 1 - Math.abs(index - position) * 0.28) }}
    >{twoDigits(index % count)}</div>)}
  </div>;
}
