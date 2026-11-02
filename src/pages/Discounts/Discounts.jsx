import { BadgePercent } from "lucide-react";
import PagePlaceholder from "../../components/PagePlaceholder";
import "./Discounts.css";

export default function Discounts() {
  return (
    <div className="discounts-page">
      <PagePlaceholder
        number="02"
        eyebrow="CHEGIRMALAR"
        title="Yaxshi tanlovga yaxshi imkoniyat."
        description="Maxsus takliflar ushbu sahifada e’lon qilinadi. Hozircha tasdiqlangan chegirmalar joylanmagan; mavjud takliflarni Telegram orqali aniqlashtiring."
        icon={BadgePercent}
      >
        <span className="status-label">Takliflar tez orada</span>
      </PagePlaceholder>
    </div>
  );
}
