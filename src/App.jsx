import "./pages/Warehouse.css";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Factory,
  Wallet,
  Users,
  ChartNoAxesCombined,
  Settings,
  Menu,
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Gem,
} from "lucide-react";
import "./index.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard },
  { name: "Ombor", icon: Package },
  { name: "Sotuv", icon: ShoppingCart },
  { name: "Ishlab chiqarish", icon: Factory },
  { name: "Moliya", icon: Wallet },
  { name: "Xodimlar", icon: Users },
  { name: "Hisobotlar", icon: ChartNoAxesCombined },
  { name: "Sozlamalar", icon: Settings },
];

const statistics = [
  {
    title: "Bugungi savdo",
    value: "12 450 000 so'm",
    change: "+12.5%",
    positive: true,
    icon: ShoppingCart,
  },
  {
    title: "Ombordagi mahsulotlar",
    value: "1 284 dona",
    change: "+8.2%",
    positive: true,
    icon: Package,
  },
  {
    title: "Bugungi xarajatlar",
    value: "3 250 000 so'm",
    change: "-4.3%",
    positive: true,
    icon: Wallet,
  },
  {
    title: "Taxminiy foyda",
    value: "4 800 000 so'm",
    change: "+15.8%",
    positive: true,
    icon: TrendingUp,
  },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app">
      <aside className={`sidebar ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <div className="brand">
          <div className="brand-icon">
            <Gem size={25} />
          </div>
          <div>
            <h2>StoneX</h2>
            <span>ERP SYSTEM</span>
          </div>
        </div>

        <div className="menu-label">ASOSIY MENYU</div>

        <nav className="navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => setActivePage(item.name)}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-avatar">A</div>
          <div className="admin-info">
            <strong>Administrator</strong>
            <span>Boshqaruvchi</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="icon-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Menyuni ochish yoki yopish"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            Bosh sahifa <span>/</span> <strong>{activePage}</strong>
          </div>

          <div className="topbar-actions">
            <button className="icon-button" aria-label="Qidirish">
              <Search size={20} />
            </button>

            <button className="icon-button notification" aria-label="Bildirishnomalar">
              <Bell size={20} />
              <span></span>
            </button>

            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <h1>{activePage}</h1>
              <p>StoneX korxonasining boshqaruv paneli</p>
            </div>

            <div className="date-badge">
              {new Date().toLocaleDateString("uz-UZ")}
            </div>
          </div>

          {activePage === "Dashboard" ? (
            <>
              <div className="stats-grid">
                {statistics.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <article className="stat-card" key={stat.title}>
                      <div className="stat-top">
                        <span>{stat.title}</span>
                        <div className="stat-icon">
                          <Icon size={21} />
                        </div>
                      </div>

                      <h2>{stat.value}</h2>

                      <div className="stat-change">
                        {stat.positive ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        <span>{stat.change}</span>
                        <span className="change-label">oldingi davrga nisbatan</span>
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="content-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <div>
                      <h3>So‘nggi operatsiyalar</h3>
                      <p>Oxirgi savdo va ombor harakatlari</p>
                    </div>

                    <button className="text-button">Barchasi</button>
                  </div>

                  <div className="empty-state">
                    <Package size={38} />
                    <h4>Hozircha operatsiyalar yo‘q</h4>
                    <p>Yangi savdo yoki ombor operatsiyasi shu yerda ko‘rinadi.</p>
                  </div>
                </section>

                <section className="panel quick-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Tezkor amallar</h3>
                      <p>Kerakli bo‘limga tez o‘ting</p>
                    </div>
                  </div>

                  <button
                    className="quick-action"
                    onClick={() => setActivePage("Sotuv")}
                  >
                    <ShoppingCart size={19} />
                    <span>Yangi sotuv</span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => setActivePage("Ombor")}
                  >
                    <Package size={19} />
                    <span>Mahsulotlarni ko‘rish</span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => setActivePage("Ishlab chiqarish")}
                  >
                    <Factory size={19} />
                    <span>Ishlab chiqarishni ko‘rish</span>
                  </button>

                  <button
                    className="quick-action"
                    onClick={() => setActivePage("Moliya")}
                  >
                    <Wallet size={19} />
                    <span>Moliya hisobotlari</span>
                  </button>
                </section>
              </div>
            </>
          ) : (
            <section className="panel placeholder-panel">
              <div className="placeholder-icon">
                {(() => {
                  const selected = menuItems.find(
                    (item) => item.name === activePage
                  );
                  const Icon = selected?.icon ?? Settings;
                  return <Icon size={32} />;
                })()}
              </div>
              <h2>{activePage} bo‘limi</h2>
              <p>
                Bu bo‘limni keyingi bosqichda funksiyalar bilan to‘ldiramiz.
              </p>
              <button
                className="back-button"
                onClick={() => setActivePage("Dashboard")}
              >
                Dashboardga qaytish
              </button>
            </section>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
