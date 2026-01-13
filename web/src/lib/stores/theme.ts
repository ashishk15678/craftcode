import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark' | 'catppuccin-mocha' | 'catppuccin-latte' | 'tokyo-night' | 'rose-pine';

const defaultValue = 'dark';
const storageKey = 'theme-preference';

// Initialize with user preference or default
const initialTheme = browser ? (localStorage.getItem(storageKey) as Theme) || defaultValue : defaultValue;

export const theme = writable<Theme>(initialTheme);

// Subscribe to changes and update the document class
theme.subscribe((value) => {
    if (browser) {
        localStorage.setItem(storageKey, value);
        const html = document.documentElement;
        
        // Remove old theme classes
        html.classList.remove('light', 'dark', 'theme-catppuccin-mocha', 'theme-catppuccin-latte', 'theme-tokyo-night', 'theme-rose-pine');
        
        // Add new theme class
        if (value === 'light') {
            html.classList.add('light');
        } else if (value === 'dark') {
            html.classList.add('dark');
        } else {
             // For custom themes, we might want to keep 'dark' or 'light' as a base if they rely on tailwind's 'dark:' variant,
             // or just use the specific class if we map everything purely via CSS variables.
             // Let's assume we map everything via variables for now, but keeping 'dark' for tailwind utilities is often helpful.
             // For simplicity in this specific overhaul, I'll just add the specific class.
             // However, Catppuccin Mocha is dark-ish, Latte is light-ish.
             if (value.includes('mocha')) html.classList.add('dark');
             html.classList.add(`theme-${value}`);
        }
        
        // Set specific data attribute for easier CSS selection if needed
        html.setAttribute('data-theme', value);
    }
});
