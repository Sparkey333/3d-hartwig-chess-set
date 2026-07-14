/**
 * Clear setup steps + key site links for local Mac workflow.
 * Shared by the React app and mirrored in landing HTML.
 */

export interface GuideLink {
  label: string;
  url: string;
  note?: string;
}

export interface GuideStep {
  id: string;
  title: string;
  body: string;
  links?: GuideLink[];
  code?: string;
}

export const APP_VERSION = '1.0.0';
export const DMG_FILENAME = `Neo-Chess-${APP_VERSION}-mac.dmg`;
export const ZIP_FILENAME = `Neo-Chess-${APP_VERSION}-mac.zip`;

/** Always land packages in the Mac user’s Downloads folder for now. */
export const LOCAL_MAC_DOWNLOADS_HINT = '~/Downloads';

export const KEY_SITES: GuideLink[] = [
  {
    label: 'Higgsfield Cloud (API keys)',
    url: 'https://cloud.higgsfield.ai',
    note: 'Create account → API credentials as KEY_ID:KEY_SECRET',
  },
  {
    label: 'Higgsfield Docs',
    url: 'https://docs.higgsfield.ai',
    note: 'Official API reference for FLUX / Soul / DoP',
  },
  {
    label: 'Higgsfield JS SDK',
    url: 'https://github.com/higgsfield-ai/higgsfield-js',
    note: 'Server-only V2 client used by Neo Chess proxy',
  },
  {
    label: 'Higgsfield Status',
    url: 'https://status.higgsfield.ai',
    note: 'Check outages before debugging generation failures',
  },
  {
    label: 'Stockfish',
    url: 'https://stockfishchess.org/',
    note: 'Open-source engine powering vs-AI and analysis',
  },
  {
    label: 'chess.js',
    url: 'https://github.com/jhlywa/chess.js',
    note: 'Move validation (Lichess / Chess.com lineage)',
  },
  {
    label: 'react-chessboard',
    url: 'https://github.com/Clariity/react-chessboard',
    note: 'Board UI component',
  },
  {
    label: 'Vite',
    url: 'https://vite.dev/',
    note: 'Dev server + Higgsfield proxy host',
  },
  {
    label: 'Electron',
    url: 'https://www.electronjs.org/docs/latest/',
    note: 'Optional desktop shell (npm run desktop)',
  },
];

export const LOCAL_MAC_STEPS: GuideStep[] = [
  {
    id: 'pack',
    title: '1. Rebuild the Mac package (on this machine)',
    body: 'From the Neo Chess project root, regenerate the DMG/ZIP. Packages always copy to ~/Downloads and project Downloads/.',
    code: 'npm install\nnpm run pack:mac',
    links: [
      { label: 'Vite (dev tooling)', url: 'https://vite.dev/' },
    ],
  },
  {
    id: 'open-dmg',
    title: '2. Refresh & open the new DMG from ~/Downloads',
    body: 'After pack (or after clicking Download in the app), open the freshly written disk image on this Mac. First launch: right-click Neo Chess.app → Open.',
    code: `open ~/Downloads/${DMG_FILENAME}`,
  },
  {
    id: 'install',
    title: '3. Install Neo Chess.app',
    body: 'In the mounted volume, drag Neo Chess.app into Applications (or keep it in Downloads). Unsigned build: Gatekeeper may ask you to confirm Open.',
  },
  {
    id: 'higgsfield-keys',
    title: '4. Get Higgsfield API credentials (optional Premium AI)',
    body: 'Live FLUX board themes / avatars / replay need server-side credentials. Never put keys in VITE_* vars — the official SDK blocks browsers.',
    links: [
      { label: 'Higgsfield Cloud — create keys', url: 'https://cloud.higgsfield.ai' },
      { label: 'Higgsfield Docs', url: 'https://docs.higgsfield.ai' },
      { label: 'JS SDK README', url: 'https://github.com/higgsfield-ai/higgsfield-js' },
      { label: 'API status', url: 'https://status.higgsfield.ai' },
    ],
    code: 'export HF_CREDENTIALS="KEY_ID:KEY_SECRET"\nnpm run dev',
  },
  {
    id: 'offline-themes',
    title: '5. Or skip keys — use Procedural / Curated skins',
    body: 'Premium → Board Theme Studio → choose Procedural or Curated (Hartwig-inspired). Works fully offline on this Mac.',
  },
  {
    id: 'play',
    title: '6. Play',
    body: 'Open the app or run the web client. Legacy 3D Hartwig is linked from the footer at /legacy.',
    code: 'npm run dev\n# → http://localhost:5173',
    links: [
      { label: 'Stockfish', url: 'https://stockfishchess.org/' },
      { label: 'chess.js', url: 'https://github.com/jhlywa/chess.js' },
    ],
  },
];

export const DOWNLOAD_PATHS = {
  /** Served by Vite / packaged app (relative for file:// too) */
  dmgWeb: `./downloads/${DMG_FILENAME}`,
  zipWeb: `./downloads/${ZIP_FILENAME}`,
  landingWeb: './landing/index.html',
  /** Sibling files when landing HTML lives in ~/Downloads */
  dmgLocalSibling: `./${DMG_FILENAME}`,
  zipLocalSibling: `./${ZIP_FILENAME}`,
} as const;
