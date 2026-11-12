import useLanguage from '../../hooks/useLanguage';
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import Brand from "../Brand";
import OrderButton from "../OrderButton";
import LanguageSelector from "../LanguageSelector/LanguageSelector";
import NavItem from "./NavItem";
import { navigation } from "./navigation";

export default function MobileMenu({ close, triggerRef }) {
  const { t } = useLanguage();
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const shell = document.getElementById("site-shell");
    const previousInert = shell?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousPadding = document.body.style.paddingRight;
    const scrollbar = Math.max(
      0,
      window.innerWidth - document.documentElement.clientWidth,
    );
    if (shell) shell.inert = true;
    document.body.style.overflow = "hidden";
    if (scrollbar) document.body.style.paddingRight = `${scrollbar}px`;
    closeRef.current?.focus();
    const focusable = () => [
      ...panelRef.current.querySelectorAll("a[href], button:not([disabled])"),
    ];
    function handleKey(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        const items = focusable();
        const first = items[0];
        const last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    function containFocus(event) {
      if (!panelRef.current?.contains(event.target)) closeRef.current?.focus();
    }
    document.addEventListener("keydown", handleKey);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.removeEventListener("focusin", containFocus);
      if (shell) shell.inert = previousInert ?? false;
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPadding;
      if (window.matchMedia("(min-width: 1100px)").matches) {
        document.querySelector(".navbar .brand")?.focus();
      } else {
        triggerRef.current?.focus();
      }
    };
  }, [close, triggerRef]);
  return createPortal(
    <motion.div
      className="mobile-menu-layer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.2 }}
    >
      <div className="mobile-backdrop" onClick={close} aria-hidden="true" />
      <motion.aside
        id="mobile-navigation"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
        className="mobile-panel"
        initial={{ x: reduceMotion ? 0 : "100%" }}
        animate={{ x: 0 }}
        exit={{ x: reduceMotion ? 0 : "100%" }}
        transition={{
          duration: reduceMotion ? 0 : 0.35,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="mobile-panel-top">
          <span id="mobile-menu-title">{t('nav.menu')}</span>
          <button
            ref={closeRef}
            className="icon-button"
            onClick={close}
            aria-label={t('nav.close_menu')}
          >
            <X size={23} aria-hidden="true" />
          </button>
        </div>
        <Brand onClick={close} />
        <nav aria-label={t('nav.mobile')}>
          <LayoutGroup id="mobile-nav">
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: reduceMotion ? 0 : 0.055,
                    delayChildren: reduceMotion ? 0 : 0.08,
                  },
                },
              }}
            >
              {navigation.map((item, index) => (
                <motion.li
                  key={item.to}
                  variants={{
                    hidden: { opacity: 0, x: reduceMotion ? 0 : 14 },
                    visible: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                >
                  <span className="mobile-link-number" aria-hidden="true">
                    0{index + 1}
                  </span>
                  <NavItem item={item} onClick={close} />
                  <ArrowUpRight size={17} aria-hidden="true" />
                </motion.li>
              ))}
            </motion.ul>
          </LayoutGroup>
        </nav>
        <div className="mobile-panel-bottom">
          <p>{t('nav.start_together')}</p>
          <LanguageSelector className="mobile-lang-selector" />
          <OrderButton onClick={close} />
          <span>{t('nav.materials_tagline')}</span>
        </div>
      </motion.aside>
    </motion.div>,
    document.body,
  );
}
