import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AnimatedOutlet from "../components/AnimatedOutlet";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import ProductDetails from '../pages/ProductDetails/ProductDetails';
import Discounts from "../pages/Discounts/Discounts";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import AdminLogin from "../pages/Admin/AdminLogin";
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminProducts from "../pages/Admin/AdminProducts";
import AdminCategories from "../pages/Admin/AdminCategories";
import AdminDiscounts from "../pages/Admin/AdminDiscounts";
import AdminSettings from "../pages/Admin/AdminSettings";
import ForgotPassword from "../components/Auth/ForgotPassword";
import ResetPassword from "../components/Auth/ResetPassword";
import ProtectedRoute from "../components/Auth/ProtectedRoute";
import { AuthProvider } from "../context/AuthContext";
import { aboutSeo } from '../data/aboutData';
import useLanguage from '../hooks/useLanguage';

const defaultDescription = 'Namuna Tosh Markazi — kerama granit, sokl, zinapoya va tosh mahsulotlari. Mahsulot va buyurtmalar haqida Telegram orqali bog‘laning.';

const titles = {
  "/": "Bosh sahifa",
  "/products": "Mahsulotlar",
  "/discounts": "Chegirmalar",
  "/about": "Biz haqimizda",
  "/contact": "Bog‘lanish",
  "/admin": "Admin Dashboard",
  "/admin/login": "Admin — Tizimga kirish",
  "/admin/forgot-password": "Admin — Parolni tiklash",
  "/admin/reset-password": "Admin — Yangi parol",
  "/admin/products": "Admin — Mahsulotlar",
  "/admin/categories": "Admin — Kategoriyalar",
  "/admin/discounts": "Admin — Chegirmalar",
  "/admin/settings": "Admin — Sozlamalar",
};

export default function AppRoutes() {
  const location = useLocation();
  const { t } = useLanguage();
  useEffect(() => {
    const publicTitles = {
      '/': t('nav.home'), '/products': t('nav.products'), '/discounts': t('nav.discounts'),
      '/about': t('nav.about'), '/contact': t('nav.contact'),
    };
    const pageTitle = publicTitles[location.pathname] || titles[location.pathname] ||
      (location.pathname.startsWith('/products/') ? t('seo.product_title') : t('not_found.title'));
    if (!location.pathname.startsWith('/products/')) {
      document.title = location.pathname === '/about'
        ? `${t('nav.about')} | ${t('brand.name')}`
        : `${pageTitle} — ${t('brand.name')}`;
    }
    let description = document.querySelector('meta[name="description"]');
    if (!description) {
      description = document.createElement('meta');
      description.name = 'description';
      document.head.append(description);
    }
    description.content = location.pathname === '/about'
      ? t('seo.about_description', aboutSeo.description)
      : t('seo.description', defaultDescription);
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      const meta = document.querySelector(selector);
      if (meta) meta.content = document.title;
    }
    const siteName = document.querySelector('meta[property="og:site_name"]');
    if (siteName) siteName.content = t('brand.name');
    for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      const meta = document.querySelector(selector);
      if (meta) meta.content = description.content;
    }
    for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
      try {
        const business = JSON.parse(script.textContent);
        if (business['@type'] === 'LocalBusiness') {
          script.textContent = JSON.stringify({ ...business, name: t('brand.name'), description: description.content });
        }
      } catch { /* Leave unrelated structured data untouched. */ }
    }
  }, [location.pathname, t]);

  return (
    <AuthProvider>
      <Routes>
        {/* Public store routes */}
        <Route element={<MainLayout />}>
          <Route element={<AnimatedOutlet />}>
            <Route index element={<Home />} />
            <Route path="products" element={<Products />} />
            <Route path="products/:slug" element={<ProductDetails />} />
            <Route path="discounts" element={<Discounts />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Admin layout */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Public auth routes under admin layout */}
          <Route path="login" element={<AdminLogin />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Protected administrative routes */}
          <Route element={<ProtectedRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="discounts" element={<AdminDiscounts />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
