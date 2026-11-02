import { Link, Outlet } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <a className="skip-link" href="#admin-content">
        Asosiy mazmunga o‘tish
      </a>
      <header className="admin-header container">
        <span>
          NAMUNA <span className="gold-text">/ ADMIN</span>
        </span>
        <Link className="text-link" to="/">
          <ArrowLeft size={16} aria-hidden="true" /> Saytga qaytish
        </Link>
      </header>
      <main id="admin-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
