import { ChartNoAxesCombined, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Sales must contain { id, time, amount }; inventory valuations are not revenue.
export default function RevenueChart({ start, end, periodLabel, periodRange, sales = [] }) {
  const plot = useRef(null);
  const [hover, setHover] = useState(null);
  const [plotSize, setPlotSize] = useState({ width: 590, height: 240 });
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);
      if (width > 0 && height > 0) {
        setPlotSize((current) => current.width === width && current.height === height ? current : { width, height });
      }
    });
    observer.observe(plot.current);
    return () => observer.disconnect();
  }, []);
  const [configured, setConfigured] = useState(false);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [ai, setAi] = useState({ key: "", loading: false, text: "" });
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/revenue-analysis", { signal: controller.signal })
      .then((response) => response.ok ? response.json() : { configured: false })
      .then((result) => { setConfigured(result.configured === true); setStatusLoaded(true); })
      .catch(() => { if (!controller.signal.aborted) setStatusLoaded(true); });
    return () => controller.abort();
  }, []);
  const matchingSales = sales.filter((sale) => {
    const time = Date.parse(sale.time);
    return Number.isFinite(sale.amount) && sale.amount >= 0 && time >= start && time < end;
  });
  const hasData = matchingSales.length > 0;
  const daily = periodLabel === "Kunlik";
  const bucketCount = daily ? 48 : periodLabel === "6 oylik" ? 6 : periodLabel === "1 yillik" ? 12 : Math.round((end - start) / 86400000);
  const monthly = periodLabel === "6 oylik" || periodLabel === "1 yillik";
  const startDate = new Date(start + 5 * 3600000);
  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    const time = monthly
      ? Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth() + index, 1) - 5 * 3600000
      : start + index * (daily ? 1800000 : 86400000);
    return { time, value: 0 };
  });
  matchingSales.forEach((sale) => {
    const index = buckets.findLastIndex((bucket) => Date.parse(sale.time) >= bucket.time);
    if (index >= 0) buckets[index].value += sale.amount;
  });
  const total = matchingSales.reduce((sum, sale) => sum + sale.amount, 0);
  const requestKey = JSON.stringify({ start, end, buckets, count: matchingSales.length });
  const currentAi = ai.key === requestKey ? ai : { loading: false, text: "" };
  async function analyze() {
    setAi({ key: requestKey, loading: true, text: "" });
    try {
      const response = await fetch("/api/revenue-analysis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: AbortSignal.timeout(35000),
        body: JSON.stringify({ period: periodLabel, buckets, saleCount: matchingSales.length }),
      });
      const result = await response.json();
      setAi({ key: requestKey, loading: false, text: response.ok ? result.analysis : result.error || "Tahlil bajarilmadi." });
    } catch {
      setAi({ key: requestKey, loading: false, text: "Serverga ulanib bo‘lmadi. Qayta urinib ko‘ring." });
    }
  }
  const maximum = Math.max(1, ...buckets.map((bucket) => bucket.value));
  const plotWidth = daily ? Math.max(plotSize.width, 64 + (bucketCount - 1) * 52 + 20) : plotSize.width;
  const plotRight = plotWidth - 20;
  const plotBottom = plotSize.height - 32;
  const x = (index) => 64 + index * (plotRight - 64) / Math.max(1, buckets.length - 1);
  const y = (value) => plotBottom - value / maximum * (plotBottom - 18);
  const money = (value) => value.toLocaleString("uz-UZ") + " so‘m";
  const label = (time) => new Date(time).toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
    ...(periodLabel === "Kunlik" ? { hour: "2-digit", minute: "2-digit" } : monthly ? { month: "short" } : { day: "numeric", month: "short" }),
  });
  const activeBucket = hover?.key === requestKey ? buckets[hover.index] : null;
  function showSale(event) {
    if (!hasData) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) * plotWidth / bounds.width;
    const index = Math.max(0, Math.min(buckets.length - 1, Math.round((pointerX - 64) / (plotRight - 64) * (buckets.length - 1))));
    const scrollLeft = plot.current.scrollLeft;
    setHover({ key: requestKey, index, left: Math.max(scrollLeft + 8, Math.min(x(index) - 100, scrollLeft + plotSize.width - 208)) });
  }

  return <section className="panel revenue-panel" aria-labelledby="revenue-title">
    <div className="panel-heading">
      <div><h3 id="revenue-title">Daromad tahlili</h3><p>{periodLabel} · {periodRange}</p></div>
      <ChartNoAxesCombined size={21} aria-hidden="true" />
    </div>
    <div className="revenue-total"><strong>{hasData ? money(total) : "—"}</strong><span>Sotuv tushumi</span></div>
    <div className="revenue-plot" ref={plot} onPointerLeave={() => setHover(null)} onScroll={() => setHover(null)}>
      <svg onPointerMove={showSale} onPointerDown={showSale} style={{ width: plotWidth }} viewBox={`0 0 ${plotWidth} ${plotSize.height}`} role="img" aria-label={hasData ? `${periodLabel} daromad diagrammasi: ${money(total)}` : "Sotuv ma’lumotlari hali ulanmagan; diagramma bo‘sh"}>
        {[0, 0.5, 1].map((ratio) => <g key={ratio}>
          <line x1="64" x2={plotRight} y1={y(maximum * ratio)} y2={y(maximum * ratio)} stroke="#e9edf4" strokeDasharray="4 4" />
          <text x="56" y={y(maximum * ratio) + 4} textAnchor="end">{hasData ? new Intl.NumberFormat("uz-UZ", { notation: "compact" }).format(maximum * ratio) : "—"}</text>
        </g>)}
        {hasData && <polyline points={buckets.map((bucket, index) => `${x(index)},${y(bucket.value)}`).join(" ")} fill="none" stroke="#e5a000" strokeWidth="3" strokeLinejoin="round" />}
        {hasData && buckets.map((bucket, index) => <circle key={bucket.time} cx={x(index)} cy={y(bucket.value)} r="3" fill="#e5a000"><title>{label(bucket.time)}: {money(bucket.value)}</title></circle>)}
        {activeBucket && <g pointerEvents="none">
          <line x1={x(hover.index)} x2={x(hover.index)} y1="18" y2={plotBottom} stroke="#e5a000" strokeDasharray="4 4" />
          <circle cx={x(hover.index)} cy={y(activeBucket.value)} r="5" fill="#e5a000" stroke="white" strokeWidth="2" />
        </g>}
        {buckets.filter((_, index) => daily || index === 0 || index === Math.floor((buckets.length - 1) / 2) || index === buckets.length - 1).map((bucket) => <text key={bucket.time} x={x(buckets.indexOf(bucket))} y={plotSize.height - 8} textAnchor={bucket === buckets[0] ? "start" : bucket === buckets[buckets.length - 1] ? "end" : "middle"}>{label(bucket.time)}</text>)}
      </svg>
      {activeBucket && <div className="revenue-tooltip" role="tooltip" style={{ left: hover.left, top: 4 }}>
        <span>{label(activeBucket.time)}{daily ? ` – ${label(activeBucket.time + 1800000)}` : ""}</span>
        <strong>{money(activeBucket.value)}</strong>
      </div>}
      {!hasData && <span className="revenue-empty">Sotuv ma’lumotlari hali ulanmagan</span>}
    </div>
    <div className="revenue-ai">
      <Sparkles size={16} aria-hidden="true" />
      <p aria-live="polite"><strong>OpenAI tahlili</strong><span>{currentAi.loading ? "Tahlil tayyorlanmoqda…" : currentAi.text || (!statusLoaded ? "Ulanish tekshirilmoqda…" : !configured ? "OpenAI hali sozlanmagan." : !hasData ? "Tahlil uchun sotuv ma’lumotlari kerak." : "Tanlangan davr tushumlarini tahlil qiling.")}</span></p>
      <button type="button" onClick={analyze} disabled={!configured || !hasData || ai.loading}>{currentAi.loading ? "Kuting…" : "AI tahlil"}</button>
    </div>
  </section>;
}
