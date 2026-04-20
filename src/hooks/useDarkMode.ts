import { create } from 'zustand';

// Apply dark class to <html> and persist
function applyAndPersist(dark: boolean) {
  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  try { localStorage.setItem('fc-dark', String(dark)); } catch {}
}

function getInitial(): boolean {
  try {
    const stored = localStorage.getItem('fc-dark');
    if (stored !== null) return stored === 'true';
  } catch {}
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

// Apply immediately on module load — before first React render — to avoid flash
const initial = getInitial();
applyAndPersist(initial);

interface DarkStore {
  isDark: boolean;
  toggle: () => void;
}

// Single Zustand store shared by every component
export const useDarkMode = create<DarkStore>((set, get) => ({
  isDark: initial,
  toggle: () => {
    const next = !get().isDark;
    applyAndPersist(next);
    set({ isDark: next });
  },
}));
