import useLanguage from '../../hooks/useLanguage';
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import useTheme from "../../hooks/useTheme";
import "./ThemeToggle.css";

export default function ThemeToggle() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const reduced = useReducedMotion();
  const label =
    theme === "dark" ? t('theme.light') : t('theme.dark');
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{
            opacity: 0,
            rotate: reduced ? 0 : -35,
            y: reduced ? 0 : 5,
          }}
          animate={{ opacity: 1, rotate: 0, y: 0 }}
          exit={{ opacity: 0, rotate: reduced ? 0 : 35, y: reduced ? 0 : -5 }}
          transition={{ duration: reduced ? 0 : 0.125 }}
        >
          <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
