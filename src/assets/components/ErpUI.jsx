import { money } from "../../erp.js";
import { useLayoutEffect, useRef } from "react";
import "./ErpUI.css";

export function TableScroll({ children, maxRows, count }) {
  const wrapperRef = useRef(null);
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!maxRows || count <= maxRows) {
      wrapper.style.removeProperty("max-height");
      return;
    }
    const table = wrapper.querySelector("table");
    const updateHeight = () => {
      const lastVisibleRow = table.tBodies[0]?.rows[maxRows - 1];
      if (lastVisibleRow) {
        wrapper.style.maxHeight = `${lastVisibleRow.getBoundingClientRect().bottom - table.getBoundingClientRect().top}px`;
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(table);
    return () => observer.disconnect();
  }, [children, maxRows, count]);
  return <div ref={wrapperRef} className={`warehouse-table-wrapper${maxRows && count > maxRows ? " erp-table-scroll" : ""}`}>{children}</div>;
}

export function Summary({ items, className = "" }) {
  return <div className={`warehouse-summary ${className}`}>{items.map(([label, value]) => <article className="warehouse-summary-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>;
}
export function DataTable({ headings, children, empty, count, maxRows }) {
  return <section className="warehouse-table-panel"><TableScroll maxRows={maxRows} count={count}><table className="warehouse-table"><thead><tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr></thead><tbody>{count ? children : <tr><td className="warehouse-empty" colSpan={headings.length}>{empty || "Hozircha ma’lumot yo‘q."}</td></tr>}</tbody></table></TableScroll><div className="warehouse-table-footer">Jami: {count} ta yozuv</div></section>;
}
export function Notice({ message }) {
  return message ? <p className={`sales-message ${message.error ? "sales-error" : ""}`} role={message.error ? "alert" : "status"}>{message.text}</p> : null;
}
export function FinancialSummary({ sales, expenses }) {
  const income = sales.reduce((sum, item) => sum + item.amount, 0);
  const spent = expenses.reduce((sum, item) => sum + item.amount, 0);
  return <Summary items={[["Sotuv tushumi", money(income)], ["Qayd etilgan xarajat", money(spent)], ["Tushum va xarajat farqi", money(income - spent)]]} />;
}
