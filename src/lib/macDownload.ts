/**
 * Local-Mac download helpers: always target ~/Downloads for now,
 * cache-bust to refresh the package, then attempt to open the DMG.
 */

import { DMG_FILENAME, ZIP_FILENAME, LOCAL_MAC_DOWNLOADS_HINT } from '../data/setupGuide';

const DMG_HREF = `./downloads/${DMG_FILENAME}`;
const ZIP_HREF = `./downloads/${ZIP_FILENAME}`;

function bust(url: string): string {
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}t=${Date.now()}`;
}

function triggerDownload(href: string, filename: string): void {
  const a = document.createElement('a');
  a.href = bust(href);
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Download a fresh DMG into the browser’s Downloads folder (on this Mac: ~/Downloads),
 * then try to open/mount it.
 */
export async function downloadAndOpenLocalMacDmg(): Promise<void> {
  triggerDownload(DMG_HREF, DMG_FILENAME);

  // Give the browser a moment to start the save into ~/Downloads
  await new Promise((r) => setTimeout(r, 600));

  // Prefer Electron path if exposed
  const neo = (window as Window & {
    neoDesktop?: { openDownloadsDmg?: () => Promise<void> };
  }).neoDesktop;
  if (neo?.openDownloadsDmg) {
    await neo.openDownloadsDmg();
    return;
  }

  // Safari/Chrome on Mac: navigating to the same file URL often re-prompts;
  // also try opening the served copy which Finder may hand to DiskImageMounter.
  const openUrl = bust(DMG_HREF);
  window.open(openUrl, '_blank', 'noopener,noreferrer');
}

export async function downloadLocalMacZip(): Promise<void> {
  triggerDownload(ZIP_HREF, ZIP_FILENAME);
}

export function localMacDownloadLabel(): string {
  return `Saves to ${LOCAL_MAC_DOWNLOADS_HINT} on this Mac, then opens the new DMG`;
}

export { DMG_HREF, ZIP_HREF, DMG_FILENAME, ZIP_FILENAME };
