import { Send } from "lucide-react";
import PagePlaceholder from "../../components/PagePlaceholder";
import { orderUrl } from "../../components/Navbar/navigation";
import "./Contact.css";

export default function Contact() {
  return (
    <div className="contact-page">
      <PagePlaceholder
        number="04"
        eyebrow="BOG‘LANISH"
        title="Suhbatdan boshlaymiz."
        description="Mahsulot, o‘lcham va buyurtma bo‘yicha savollaringizni Telegram orqali yuboring. Loyihangiz haqida yozib qoldiring."
        icon={Send}
      >
        <a
          className="contact-account"
          href={orderUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          @aura_200707 <span>Telegram · yangi oynada ochiladi ↗</span>
        </a>
      </PagePlaceholder>
    </div>
  );
}
