import { ShieldEllipsis } from "lucide-react";
import "./Admin.css";

export default function Admin() {
  return (
    <section className="admin-page container">
      <ShieldEllipsis size={40} strokeWidth={1} aria-hidden="true" />
      <span className="page-eyebrow">BOSHLANG‘ICH SAHIFA</span>
      <h1>Admin panel</h1>
      <p>
        Bu sahifa hozircha placeholder. Boshqaruv funksiyalari va server
        tomonidagi autentifikatsiya keyingi bosqichda qo‘shiladi.
      </p>
      <div className="admin-notice">
        Ushbu sahifa hozir himoyalanmagan. Bu yerda maxfiy ma’lumotlar yoki
        boshqaruv amallari mavjud emas.
      </div>
    </section>
  );
}
