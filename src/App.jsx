import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";
import ThemeProvider from "./context/ThemeContext";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <MotionConfig reducedMotion="user">
          <ScrollToTop />
          <AppRoutes />
        </MotionConfig>
      </BrowserRouter>
    </ThemeProvider>
  );
}
