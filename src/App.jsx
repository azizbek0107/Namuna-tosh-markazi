import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "motion/react";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/ScrollToTop";

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <ScrollToTop />
        <AppRoutes />
      </MotionConfig>
    </BrowserRouter>
  );
}
