/**
 * Alternative board-theme generators that work without external AI APIs.
 * Used as fallback when Higgsfield credentials are absent, and as
 * first-class "curated" / "procedural" providers in Premium.
 */

export interface BoardThemeConfig {
  lightSquare: string;
  darkSquare: string;
  highlightColor: string;
  pieceStyle: string;
  boardLabel: string;
  accent?: string;
  background?: string;
}

export interface ThemeGenerationResult {
  source: 'higgsfield' | 'procedural' | 'curated' | 'legacy';
  description: string;
  previewUrl?: string;
  themeConfig: BoardThemeConfig;
}

/** Curated skins inspired by original Hartwig themes + Neo defaults */
export const CURATED_THEMES: Record<string, BoardThemeConfig> = {
  classic: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlightColor: '#cdd26a',
    pieceStyle: 'classic-wood',
    boardLabel: 'Classic Wood',
    accent: '#8b5a2b',
    background: 'linear-gradient(160deg, #1a1510, #2c241c)',
  },
  marble: {
    lightSquare: '#e8e8e8',
    darkSquare: '#4a5568',
    highlightColor: '#63b3ed',
    pieceStyle: 'marble',
    boardLabel: 'Marble',
    accent: '#718096',
    background: 'linear-gradient(160deg, #0f1419, #1a2332)',
  },
  flat: {
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    highlightColor: '#3b82f6',
    pieceStyle: 'flat-minimal',
    boardLabel: 'Flat Minimal',
    accent: '#64748b',
    background: 'linear-gradient(160deg, #0b1220, #152033)',
  },
  wireframe: {
    lightSquare: '#1e293b',
    darkSquare: '#0f172a',
    highlightColor: '#22d3ee',
    pieceStyle: 'wireframe',
    boardLabel: 'Wireframe',
    accent: '#06b6d4',
    background: 'linear-gradient(160deg, #020617, #0f172a)',
  },
  neoGlass: {
    lightSquare: '#e0e7ff',
    darkSquare: '#1e1b4b',
    highlightColor: '#a78bfa',
    pieceStyle: 'neo-glass',
    boardLabel: 'Neo Glass',
    accent: '#6366f1',
    background: 'radial-gradient(circle at 30% 20%, #312e81, #0f172a 70%)',
  },
  midnightEmerald: {
    lightSquare: '#d1fae5',
    darkSquare: '#064e3b',
    highlightColor: '#34d399',
    pieceStyle: 'emerald',
    boardLabel: 'Midnight Emerald',
    accent: '#10b981',
    background: 'linear-gradient(160deg, #022c22, #064e3b)',
  },
  crimsonDusk: {
    lightSquare: '#fecaca',
    darkSquare: '#7f1d1d',
    highlightColor: '#f97316',
    pieceStyle: 'crimson',
    boardLabel: 'Crimson Dusk',
    accent: '#ef4444',
    background: 'linear-gradient(160deg, #450a0a, #1c1917)',
  },
};

function hashPrompt(prompt: string): number {
  let h = 2166136261;
  for (let i = 0; i < prompt.length; i++) {
    h ^= prompt.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hsl(h: number, s: number, l: number): string {
  return `hsl(${Math.round(h) % 360} ${Math.round(s)}% ${Math.round(l)}%)`;
}

/**
 * Deterministic procedural theme from a prompt — works offline, no API key.
 * Seeds palette + label from prompt hash so the same request is reproducible.
 */
export function generateProceduralTheme(
  prompt: string,
  style: 'traditional' | 'neo' | 'competition' = 'neo',
): ThemeGenerationResult {
  const seed = hashPrompt(prompt.toLowerCase().trim() || 'neo chess');
  const hue = seed % 360;
  const satBoost = style === 'neo' ? 18 : style === 'competition' ? 8 : 0;

  const light = hsl(hue, 28 + satBoost, style === 'traditional' ? 82 : 78);
  const dark = hsl((hue + 40) % 360, 35 + satBoost, style === 'neo' ? 18 : 28);
  const highlight = hsl((hue + 180) % 360, 70, 55);
  const accent = hsl(hue, 65, 55);

  const keywords = prompt.toLowerCase();
  let pieceStyle = 'procedural';
  if (/glass|hologram|neon|cyber/.test(keywords)) pieceStyle = 'neo-glass';
  else if (/wood|classic|oak|walnut/.test(keywords)) pieceStyle = 'classic-wood';
  else if (/marble|stone/.test(keywords)) pieceStyle = 'marble';
  else if (/wire|minimal|flat/.test(keywords)) pieceStyle = 'wireframe';

  return {
    source: 'procedural',
    description: `Procedural "${prompt.trim() || 'Neo default'}" — ${style} palette (hue ${hue}°). No API key required.`,
    themeConfig: {
      lightSquare: light,
      darkSquare: dark,
      highlightColor: highlight,
      pieceStyle,
      boardLabel: prompt.trim().slice(0, 40) || 'Procedural',
      accent,
      background: `radial-gradient(circle at 25% 15%, ${hsl(hue, 40, 25)}, #0b1220 65%)`,
    },
  };
}

export function getCuratedTheme(id: keyof typeof CURATED_THEMES): ThemeGenerationResult {
  const theme = CURATED_THEMES[id];
  return {
    source: 'curated',
    description: `Curated skin: ${theme.boardLabel}. Inspired by Hartwig classic themes + Neo defaults.`,
    themeConfig: theme,
  };
}

export function listCuratedThemes(): Array<{ id: string; label: string }> {
  return Object.entries(CURATED_THEMES).map(([id, t]) => ({ id, label: t.boardLabel }));
}

const THEME_STORAGE_KEY = 'neo-chess-active-theme';

export function saveActiveTheme(theme: BoardThemeConfig): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
  } catch {
    /* ignore quota */
  }
}

export function loadActiveTheme(): BoardThemeConfig | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as BoardThemeConfig) : null;
  } catch {
    return null;
  }
}
