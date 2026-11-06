export const DARK_THEME = "dark";
export const LIGHT_THEME = "light";

const THEME_STORAGE_KEY = "theme";
const DEFAULT_THEME = DARK_THEME;

export const themeScript = `(() => {
  let theme = ${JSON.stringify(DEFAULT_THEME)};
  try {
    if (localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)}) === ${JSON.stringify(LIGHT_THEME)}) theme = ${JSON.stringify(LIGHT_THEME)};
  } catch {}
  const root = document.documentElement;
  root.classList.toggle(${JSON.stringify(DARK_THEME)}, theme === ${JSON.stringify(DARK_THEME)});
  root.style.colorScheme = theme;
})();`;

export function applyTheme(isDark: boolean): void {
  const root = document.documentElement;
  const theme = isDark ? DARK_THEME : LIGHT_THEME;

  root.classList.toggle(DARK_THEME, isDark);
  root.style.colorScheme = theme;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be blocked; the theme still changes for this page view.
  }
}
