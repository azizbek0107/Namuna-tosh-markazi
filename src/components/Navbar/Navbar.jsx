import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup } from "motion/react";
import { Menu } from "lucide-react";
import Brand from "../Brand";
import OrderButton from "../OrderButton";
import NavItem from "./NavItem";
import MobileMenu from "./MobileMenu";
import { navigation } from "./navigation";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const triggerRef = useRef(null);
  const { pathname } = useLocation();
  const close = useCallback(() => setIsOpen(false), []);
  useEffect(() => {
    close();
  }, [pathname, close]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    const desktop = window.matchMedia("(min-width: 1100px)");
    const onDesktop = (event) => {
      if (event.matches) close();
    };
    desktop.addEventListener("change", onDesktop);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [close]);
  return (
    <>
      <header className={`navbar${scrolled ? " navbar-scrolled" : ""}`}>
        <div className="navbar-inner container">
          <Brand />
          <nav className="desktop-navigation" aria-label="Asosiy navigatsiya">
            <LayoutGroup id="desktop-nav">
              <ul>
                {navigation.map((item) => (
                  <li key={item.to}>
                    <NavItem item={item} />
                  </li>
                ))}
              </ul>
            </LayoutGroup>
          </nav>
          <div className="navbar-actions">
            <OrderButton />
            <button
              ref={triggerRef}
              className="icon-button menu-toggle"
              aria-label="Menyuni ochish"
              aria-expanded={isOpen}
              aria-controls={isOpen ? "mobile-navigation" : undefined}
              onClick={() => setIsOpen(true)}
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <MobileMenu key="mobile-menu" close={close} triggerRef={triggerRef} />
        )}
      </AnimatePresence>
    </>
  );
}
