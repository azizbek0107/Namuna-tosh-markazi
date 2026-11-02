import { Layers3 } from "lucide-react";
import PagePlaceholder from "../../components/PagePlaceholder";
import "./Products.css";

export default function Products() {
  return (
    <div className="products-page">
      <PagePlaceholder
        number="01"
        eyebrow="MAHSULOTLAR"
        title="Makoningizga mos tanlov."
        description="Kerama granit, sokl va zinapoya mahsulotlari katalogi tez orada shu yerda bo‘ladi. Hozircha kerakli mahsulot haqida Telegram orqali so‘rashingiz mumkin."
        icon={Layers3}
      >
        <span className="status-label">Katalog tayyorlanmoqda</span>
      </PagePlaceholder>
    </div>
  );
}
