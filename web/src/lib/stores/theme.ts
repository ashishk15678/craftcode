import { browser } from "$app/environment";
import { writable } from "svelte/store";

export type Theme =
  | "light"
  | "dark"
  | "catppuccin-mocha"
  | "catppuccin-latte"
  | "tokyo-night"
  | "rose-pine";

const defaultValue = "dark";
const storageKey = "theme-preference";

const initialTheme = browser
  ? (localStorage.getItem(storageKey) as Theme) || defaultValue
  : defaultValue;

export const theme = writable<Theme>(initialTheme);

theme.subscribe((value) => {
  if (browser) {
    localStorage.setItem(storageKey, value);
    const html = document.documentElement;

    html.classList.remove(
      "light",
      "dark",
      "theme-catppuccin-mocha",
      "theme-catppuccin-latte",
      "theme-tokyo-night",
      "theme-rose-pine",
    );

    if (value === "light") {
      html.classList.add("light");
    } else if (value === "dark") {
      html.classList.add("dark");
    } else {
      // if (value.includes("mocha")) html.classList.add("dark");
      html.classList.add(`theme-${value}`);
    }

    html.setAttribute("data-theme", value);
  }
});
