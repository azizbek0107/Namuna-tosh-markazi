import { Gem } from "lucide-react";
import PagePlaceholder from "../../components/PagePlaceholder";
import "./About.css";

export default function About() {
  return (
    <div className="about-page">
      <PagePlaceholder
        number="03"
        eyebrow="BIZ HAQIMIZDA"
        title="Har bir detalning o‘z o‘rni bor."
        description="Namuna Tosh Markazi — kerama granit va tosh mahsulotlari yo‘nalishi. Markazimiz va faoliyatimiz haqida batafsil ma’lumot shu yerga qo‘shiladi."
        icon={Gem}
      >
        <span className="status-label">Markaz bilan tanishing</span>
      </PagePlaceholder>
    </div>
  );
}
