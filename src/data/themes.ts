export type BoardThemeId =
  | 'hartwig-classic'
  | 'hartwig-marble'
  | 'tournament-blue'
  | 'neo-pulse'
  | 'midnight-walnut'
  | 'ai-custom';

export type PieceSetId =
  | 'neo-standard'
  | 'hartwig-classic'
  | 'hartwig-marble'
  | 'neo-glass'
  | 'neo-steel';

export interface BoardTheme {
  id: BoardThemeId;
  name: string;
  tagline: string;
  lightSquare: string;
  darkSquare: string;
  highlight: string;
  source: 'legacy' | 'neo' | 'ai';
  textureHint?: string;
}

export interface PieceSet {
  id: PieceSetId;
  name: string;
  tagline: string;
  source: 'legacy' | 'neo' | 'ai';
}

export const BOARD_THEMES: BoardTheme[] = [
  {
    id: 'hartwig-classic',
    name: 'Hartwig Classic',
    tagline: 'Upgraded from the original 3D Hartwig wood set',
    lightSquare: '#e8d5b5',
    darkSquare: '#8b5a2b',
    highlight: '#fbbf24',
    source: 'legacy',
    textureHint: 'classic-wood',
  },
  {
    id: 'hartwig-marble',
    name: 'Hartwig Marble',
    tagline: 'Legacy marble frame textures, remastered for 2D play',
    lightSquare: '#ebe6e0',
    darkSquare: '#6b7280',
    highlight: '#94a3b8',
    source: 'legacy',
    textureHint: 'marble',
  },
  {
    id: 'tournament-blue',
    name: 'Tournament Blue',
    tagline: 'Competition hall boards — high contrast for OTB prep',
    lightSquare: '#dbeafe',
    darkSquare: '#1d4ed8',
    highlight: '#38bdf8',
    source: 'neo',
  },
  {
    id: 'neo-pulse',
    name: 'Neo Pulse',
    tagline: 'Dark glass arena for Neo modes and streams',
    lightSquare: '#1f2937',
    darkSquare: '#0b1020',
    highlight: '#a78bfa',
    source: 'neo',
  },
  {
    id: 'midnight-walnut',
    name: 'Midnight Walnut',
    tagline: 'Warm classic alternative without cream-seriffed clichés',
    lightSquare: '#c4a484',
    darkSquare: '#3b2416',
    highlight: '#34d399',
    source: 'neo',
  },
  {
    id: 'ai-custom',
    name: 'AI Custom',
    tagline: 'Generated via Higgsfield / OpenAI / procedural fallback',
    lightSquare: '#1f2937',
    darkSquare: '#0f172a',
    highlight: '#4fd1c5',
    source: 'ai',
  },
];

export const PIECE_SETS: PieceSet[] = [
  { id: 'neo-standard', name: 'Neo Standard', tagline: 'Clean Unicode/SVG default', source: 'neo' },
  { id: 'hartwig-classic', name: 'Hartwig Classic', tagline: 'Legacy classic piece silhouette', source: 'legacy' },
  { id: 'hartwig-marble', name: 'Hartwig Marble', tagline: 'Legacy marble spheres', source: 'legacy' },
  { id: 'neo-glass', name: 'Neo Glass', tagline: 'Premium translucent style cue', source: 'neo' },
  { id: 'neo-steel', name: 'Neo Steel', tagline: 'Competition metal accents', source: 'neo' },
];

export const HANDICAPS = [
  { id: 'none', label: 'Even game', pieceOdds: null as null | string, timeOddsSeconds: 0 },
  { id: 'pawn', label: 'Pawn odds (White removes f2)', pieceOdds: 'f2', timeOddsSeconds: 0 },
  { id: 'knight', label: 'Knight odds (White removes b1)', pieceOdds: 'b1', timeOddsSeconds: 0 },
  { id: 'time-60', label: 'Time odds (+60s for Black)', pieceOdds: null, timeOddsSeconds: 60 },
  { id: 'time-180', label: 'Time odds (+3m for Black)', pieceOdds: null, timeOddsSeconds: 180 },
] as const;

export type HandicapId = (typeof HANDICAPS)[number]['id'];
