import { ChartBar } from "lucide-react";
import { getProductSales } from "../../productSales.js";

const quantityLabel = (value) => value.toLocaleString("uz-UZ", { maximumFractionDigits: 9 });
const axisLabel = (value) => value.toLocaleString("uz-UZ", { notation: "compact", maximumFractionDigits: 1 });

export default function ProductSalesChart({ sales = [], start, end, periodLabel, periodRange }) {
  const rows = getProductSales(sales, start, end);
  const groups = new Map();
  for (const row of rows) {
    if (!groups.has(row.unit)) groups.set(row.unit, []);
    groups.get(row.unit).push(row);
  }

  return <section className="panel product-sales-panel" aria-labelledby="product-sales-title">
    <div className="panel-heading">
      <div><h3 id="product-sales-title">Mahsulotlar bo‘yicha sotuv</h3><p>{periodLabel} · {periodRange}</p></div>
      <ChartBar size={21} aria-hidden="true" />
    </div>
    {rows.length ? <>
      <div className="product-sales-body" tabIndex={0} role="region" aria-label="Mahsulotlarning sotilgan miqdorlari">
        {[...groups].map(([unit, products]) => {
          const maximum = products[0].quantity;
          return <figure className="product-sales-group" key={unit}>
            <figcaption>Sotilgan miqdor{unit ? ` (${unit})` : ""}</figcaption>
            <div className="product-sales-axis" aria-hidden="true"><span>0</span><span>{axisLabel(maximum / 2)}</span><span>{axisLabel(maximum)}</span></div>
            <ul className="product-sales-bars">
              {products.map((product) => <li key={product.key}>
                <div className="product-sales-label"><span>{product.name}</span><strong>{quantityLabel(product.quantity)} {unit}</strong></div>
                <div className="product-sales-track" aria-hidden="true"><span style={{ width: `${product.quantity / maximum * 100}%` }} /></div>
              </li>)}
            </ul>
          </figure>;
        })}
      </div>
      <p className="product-sales-note">{groups.size > 1 ? "Har bir o‘lchov birligi alohida taqqoslanadi." : "Eng ko‘p sotilgan mahsulotlar yuqorida."}</p>
    </> : <div className="product-sales-empty"><ChartBar size={36} aria-hidden="true" /><p>Tanlangan davrda hali mahsulot sotilmagan.</p></div>}
  </section>;
}
