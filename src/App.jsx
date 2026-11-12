import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import ThemeProvider from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/Cart/CartDrawer";

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <BrowserRouter>
            <MotionConfig reducedMotion="user">
              <ScrollToTop />
              <AppRoutes />
              <CartDrawer />
            </MotionConfig>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
