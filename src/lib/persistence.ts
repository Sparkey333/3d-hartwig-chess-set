import type { VariantId } from '../types';

const PREFS_KEY = 'neo-chess-prefs';
const GAME_KEY = 'neo-chess-saved-game';

export interface UserPrefs {
  lastTab?: string;
  engineLevel?: number;
  vsEngine?: boolean;
  orientation?: 'white' | 'black';
}

export interface SavedGame {
  fen: string;
  variant: VariantId;
  history: string[];
  checksWhite: number;
  checksBlack: number;
  savedAt: string;
}

export function loadPrefs(): UserPrefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as UserPrefs;
  } catch {
    return {};
  }
}

export function savePrefs(prefs: UserPrefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...prefs }));
  } catch {
    /* ignore */
  }
}

export function saveGame(game: SavedGame): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(game));
  } catch {
    /* ignore */
  }
}

export function loadGame(): SavedGame | null {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    return raw ? (JSON.parse(raw) as SavedGame) : null;
  } catch {
    return null;
  }
}

export function clearSavedGame(): void {
  localStorage.removeItem(GAME_KEY);
}
