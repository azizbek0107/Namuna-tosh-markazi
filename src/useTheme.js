import { useLayoutEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('stonex-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* Use the system preference when storage is unavailable. */ }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add('theme-changing');
    root.dataset.theme = theme;
    try { localStorage.setItem('stonex-theme', theme); } catch { /* Keep the current session theme. */ }
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => root.classList.remove('theme-changing'));
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame);
      root.classList.remove('theme-changing');
    };
  }, [theme]);
  return [theme, setTheme];
}
