import { NavLink } from "react-router-dom";
import { motion } from "motion/react";

export default function NavItem({ item, onClick }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}
      onClick={onClick}
    >
      {({ isActive }) => (
        <>
          <span>{item.label}</span>
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
