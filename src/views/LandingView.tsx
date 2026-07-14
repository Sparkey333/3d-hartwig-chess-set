import { ArrowRight, Sparkles, MapPin, Crown } from 'lucide-react';
import { SetupGuide } from '../components/SetupGuide';
import {
  downloadAndOpenLocalMacDmg,
  downloadLocalMacZip,
  localMacDownloadLabel,
  DMG_FILENAME,
  ZIP_FILENAME,
} from '../lib/macDownload';

interface LandingViewProps {
  onPlay: () => void;
  onDownloadFocus: () => void;
}

export function LandingView({ onPlay }: LandingViewProps) {
  return (
    <div className="landing-view">
      <section className="landing-hero">
        <p className="landing-brand">Neo Chess</p>
        <h2>
          Traditional. Competition.
          <span> Neo.</span>
        </h2>
        <p className="landing-lede">
          Local Mac first — Stockfish analysis, Colorado clubs, and Premium AI boards.
          Downloads always refresh into <code>~/Downloads</code> and open the new DMG.
        </p>
        <div className="landing-ctas">
          <button type="button" className="primary-btn large" onClick={() => void downloadAndOpenLocalMacDmg()}>
            Refresh &amp; open Mac DMG
          </button>
          <button type="button" className="ghost-cta" onClick={onPlay}>
            Play in browser <ArrowRight size={16} />
          </button>
        </div>
        <p className="landing-meta">
          {localMacDownloadLabel()} · ZIP fallback:{' '}
          <button type="button" className="linkish" onClick={() => void downloadLocalMacZip()}>
            {ZIP_FILENAME}
          </button>
        </p>
      </section>

      <section className="landing-cards">
        <article>
          <Crown size={20} />
          <h3>Three philosophies</h3>
          <p>FIDE classical, competitive variants like Chess960, and Neo visual modes.</p>
        </article>
        <article>
          <MapPin size={20} />
          <h3>Colorado Springs first</h3>
          <p>Search real clubs and USCF events from local quads to master events.</p>
        </article>
        <article>
          <Sparkles size={20} />
          <h3>Premium AI</h3>
          <p>
            Higgsfield keys from{' '}
            <a href="https://cloud.higgsfield.ai" target="_blank" rel="noopener noreferrer">
              cloud.higgsfield.ai
            </a>
            , plus offline Procedural/Curated skins.
          </p>
        </article>
      </section>

      <section className="landing-download-panel" id="download">
        <h3>macOS package (this Mac → ~/Downloads)</h3>
        <div className="download-rows">
          <div className="download-row">
            <div>
              <strong>{DMG_FILENAME}</strong>
              <p>Cache-busted download → open/mount the new image → drag app to Applications</p>
            </div>
            <button type="button" className="primary-btn" onClick={() => void downloadAndOpenLocalMacDmg()}>
              Refresh &amp; open DMG
            </button>
          </div>
          <div className="download-row">
            <div>
              <strong>{ZIP_FILENAME}</strong>
              <p>Fallback package if Disk Image Mounter is blocked.</p>
            </div>
            <button type="button" className="ghost-cta" onClick={() => void downloadLocalMacZip()}>
              Download ZIP
            </button>
          </div>
        </div>
      </section>

      <SetupGuide showDownloadCta={false} />
    </div>
  );
}
