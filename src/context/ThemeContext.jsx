import {
  createContext,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export const ThemeContext = createContext(null);
export const THEME_KEY = "namuna-theme";
const valid = (value) => value === "dark" || value === "light";
const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

function initialState() {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (valid(saved)) return { theme: saved, explicit: true };
  } catch {
    /* Storage can be unavailable in private or restricted contexts. */
  }
  return { theme: systemTheme(), explicit: false };
}

export default function ThemeProvider({ children }) {
  const [{ theme, explicit }, setPreference] = useState(initialState);
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#080808" : "#F8F7F3");
  }, [theme]);

  useEffect(() => {
    if (explicit) {
      try {
        window.localStorage.setItem(THEME_KEY, theme);
      } catch {
        /* Keep the in-memory choice working. */
      }
    }
  }, [theme, explicit]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystem = (event) =>
      setPreference((current) =>
        current.explicit
          ? current
          : { theme: event.matches ? "dark" : "light", explicit: false },
      );
    const syncStorage = (event) => {
      if (event.key !== THEME_KEY && event.key !== null) return;
      setPreference(
        valid(event.newValue)
          ? { theme: event.newValue, explicit: true }
          : { theme: systemTheme(), explicit: false },
      );
    };
    query.addEventListener("change", syncSystem);
    window.addEventListener("storage", syncStorage);
    const frame = requestAnimationFrame(() => {
      document.documentElement.dataset.themeReady = "true";
    });
    return () => {
      query.removeEventListener("change", syncSystem);
      window.removeEventListener("storage", syncStorage);
      cancelAnimationFrame(frame);
    };
  }, []);

  const toggleTheme = useCallback(
    () =>
      setPreference((current) => ({
        theme: current.theme === "dark" ? "light" : "dark",
        explicit: true,
      })),
    [],
  );
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
