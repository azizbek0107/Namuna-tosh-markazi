import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import AnimatedOutlet from "../components/AnimatedOutlet";
import NotFound from "../pages/NotFound/NotFound";
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import Home from "../pages/Home/Home";
import Products from "../pages/Products/Products";
import Discounts from "../pages/Discounts/Discounts";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Admin from "../pages/Admin/Admin";

const titles = {
  "/": "Bosh sahifa",
  "/products": "Mahsulotlar",
  "/discounts": "Chegirmalar",
  "/about": "Biz haqimizda",
  "/contact": "Bog‘lanish",
  "/admin": "Admin",
};

export default function AppRoutes() {
  const location = useLocation();
  useEffect(() => {
    document.title = `${titles[location.pathname] ?? "Sahifa topilmadi"} — Namuna Tosh Markazi`;
  }, [location.pathname]);
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<AnimatedOutlet />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="discounts" element={<Discounts />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route element={<AnimatedOutlet />}>
          <Route index element={<Admin />} />
        </Route>
      </Route>
    </Routes>
  );
}
