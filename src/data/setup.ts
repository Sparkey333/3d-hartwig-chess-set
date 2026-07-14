/** Canonical key sites + install/setup steps for Mac-local Neo Chess */

export interface KeyLink {
  id: string;
  title: string;
  url: string;
  why: string;
  category: 'ai' | 'install' | 'chess' | 'colorado' | 'stack';
}

export const KEY_LINKS: KeyLink[] = [
  {
    id: 'hf-cloud',
    title: 'Higgsfield Cloud — API credentials',
    url: 'https://cloud.higgsfield.ai/',
    why: 'Create KEY_ID:KEY_SECRET for live board skins, replay, and Premium AI.',
    category: 'ai',
  },
  {
    id: 'hf-docs',
    title: 'Higgsfield API Docs',
    url: 'https://docs.higgsfield.ai',
    why: 'Official endpoints (FLUX text-to-image, Soul, image-to-video).',
    category: 'ai',
  },
  {
    id: 'hf-status',
    title: 'Higgsfield API Status',
    url: 'https://status.higgsfield.ai',
    why: 'Check platform health before diagnosing offline Premium.',
    category: 'ai',
  },
  {
    id: 'hf-js',
    title: 'Higgsfield JS SDK (GitHub)',
    url: 'https://github.com/higgsfield-ai/higgsfield-js',
    why: 'Official Node SDK used by our server/ai-proxy.mjs.',
    category: 'ai',
  },
  {
    id: 'openai-keys',
    title: 'OpenAI API Keys',
    url: 'https://platform.openai.com/api-keys',
    why: 'Optional alternative image provider when Higgsfield credits are empty.',
    category: 'ai',
  },
  {
    id: 'openai-platform',
    title: 'OpenAI Platform',
    url: 'https://platform.openai.com/',
    why: 'Billing, usage, and image model access for the fallback path.',
    category: 'ai',
  },
  {
    id: 'stockfish',
    title: 'Stockfish',
    url: 'https://stockfishchess.org/',
    why: 'Open-source engine powering vs-CPU and analysis.',
    category: 'stack',
  },
  {
    id: 'chessjs',
    title: 'chess.js',
    url: 'https://github.com/jhlywa/chess.js',
    why: 'Move validation library (also used by Lichess / Chess.com stacks).',
    category: 'stack',
  },
  {
    id: 'react-chessboard',
    title: 'react-chessboard',
    url: 'https://github.com/Clariity/react-chessboard',
    why: 'Board UI component for the web + Mac bundle.',
    category: 'stack',
  },
  {
    id: 'lichess',
    title: 'Lichess',
    url: 'https://lichess.org/',
    why: 'Reference UX for puzzles, free analysis, and open standards.',
    category: 'chess',
  },
  {
    id: 'chesscom',
    title: 'Chess.com',
    url: 'https://www.chess.com/',
    why: 'Reference for variants, premium tiers, and game review patterns.',
    category: 'chess',
  },
  {
    id: 'uschess',
    title: 'US Chess Federation',
    url: 'https://new.uschess.org/',
    why: 'National ratings, membership, and tournament calendar.',
    category: 'colorado',
  },
  {
    id: 'uschess-msa',
    title: 'US Chess MSA (ratings)',
    url: 'https://new.uschess.org/msa/',
    why: 'Look up player ratings before OTB events.',
    category: 'colorado',
  },
  {
    id: 'csca',
    title: 'Colorado State Chess Association',
    url: 'https://coloradochess.com/',
    why: 'Official CO events — Colorado Springs Class Champs, State Open, etc.',
    category: 'colorado',
  },
  {
    id: 'csca-upcoming',
    title: 'CSCA Upcoming Tournaments',
    url: 'https://coloradochess.com/tournaments/view-upcoming/',
    why: 'Live list of quads and opens near Colorado Springs.',
    category: 'colorado',
  },
  {
    id: 'ctg-co',
    title: 'Chess Tournament Guide — Colorado',
    url: 'https://chesstournamentguide.com/events/state/co/',
    why: 'Aggregated USCF calendar for Springs / Denver / Front Range.',
    category: 'colorado',
  },
];

export interface SetupStep {
  n: number;
  title: string;
  detail: string;
  links?: string[]; // KeyLink ids
}

export const MAC_INSTALL_STEPS: SetupStep[] = [
  {
    n: 1,
    title: 'Download the Mac package',
    detail:
      'Grab Neo-Chess-*-mac.dmg from this Mac’s Downloads folder (or the Home → Download DMG button). Prefer the DMG; use the ZIP if your browser blocks disk images.',
  },
  {
    n: 2,
    title: 'Open the DMG',
    detail:
      'Double-click the .dmg. If macOS warns about an unidentified developer: right-click the app → Open → Open. This build is unsigned (cross-built package for local Mac testing).',
  },
  {
    n: 3,
    title: 'Install to Applications',
    detail:
      'Drag Neo Chess.app into the Applications shortcut on the volume (or into /Applications). Eject the DMG when finished.',
  },
  {
    n: 4,
    title: 'Launch Neo Chess',
    detail:
      'Open Applications → Neo Chess. It loads the bundled web app offline. Use the Setup tab for API keys and Colorado club links.',
  },
];

export const AI_KEY_STEPS: SetupStep[] = [
  {
    n: 1,
    title: 'Get Higgsfield credentials (primary)',
    detail:
      'Sign in at Higgsfield Cloud, create API credentials, and copy them as KEY_ID:KEY_SECRET.',
    links: ['hf-cloud', 'hf-docs'],
  },
  {
    n: 2,
    title: 'Optional — OpenAI fallback',
    detail:
      'Create an API key if you want OpenAI Images when Higgsfield is offline or out of credits.',
    links: ['openai-keys'],
  },
  {
    n: 3,
    title: 'Add keys to local .env (this Mac)',
    detail:
      'In the project root create .env (never commit it):\nHF_CREDENTIALS=KEY_ID:KEY_SECRET\nOPENAI_API_KEY=sk-...\nThen run: npm run dev',
  },
  {
    n: 4,
    title: 'Verify Premium studio',
    detail:
      'Open Premium → provider status should show Higgsfield/OpenAI ready. Generate a board theme and it applies live to Play.',
    links: ['hf-status'],
  },
];

export const LOCAL_DEV_STEPS: SetupStep[] = [
  {
    n: 1,
    title: 'Install dependencies',
    detail: 'cd into the repo → npm install',
  },
  {
    n: 2,
    title: 'Start web + AI proxy',
    detail: 'npm run dev  →  http://localhost:5173  (proxy on :8787)',
  },
  {
    n: 3,
    title: 'Rebuild Mac DMG into Downloads',
    detail: 'npm run pack:mac  → writes Neo-Chess-*-mac.dmg to ./Downloads and ~/Downloads (this Mac).',
  },
];

export function linkById(id: string): KeyLink | undefined {
  return KEY_LINKS.find((l) => l.id === id);
}

export const DMG_BASENAME = 'Neo-Chess-1.1.0-mac';
export const DMG_FILE = `${DMG_BASENAME}.dmg`;
export const ZIP_FILE = `${DMG_BASENAME}.zip`;
