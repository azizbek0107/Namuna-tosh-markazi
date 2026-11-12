import { NavLink } from "react-router-dom";
import { motion } from "motion/react";
import useLanguage from "../../hooks/useLanguage";

export default function NavItem({ item, onClick }) {
  const { t } = useLanguage();
  const label = item.translationKey ? t(item.translationKey, item.label) : item.label;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          <span>{label}</span>
          {isActive && (
            <motion.span
              className="active-indicator"
              layoutId="active-nav"
              transition={{ type: "spring", stiffness: 420, damping: 36 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}
