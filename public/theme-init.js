// Runs before the first paint, using the same preference key as ThemeProvider.
(function () {
  var saved;
  try {
    saved = localStorage.getItem("namuna-theme");
  } catch (_) {}
  var theme =
    saved === "dark" || saved === "light"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", theme === "dark" ? "#080808" : "#F8F7F3");
})();
