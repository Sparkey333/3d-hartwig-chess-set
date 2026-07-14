import { Download, ArrowRight, Sparkles, MapPin, Crown } from 'lucide-react';

interface LandingViewProps {
  onPlay: () => void;
  onDownloadFocus: () => void;
}

const DMG_HREF = '/downloads/Neo-Chess-1.0.0-mac.dmg';
const ZIP_HREF = '/downloads/Neo-Chess-1.0.0-mac.zip';

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
          A new chess platform for Mac and the web — Stockfish analysis, Colorado club search,
          and Premium AI-generated board skins.
        </p>
        <div className="landing-ctas">
          <a className="primary-btn large" href={DMG_HREF} download>
            <Download size={18} /> Download Mac DMG
          </a>
          <button type="button" className="ghost-cta" onClick={onPlay}>
            Play in browser <ArrowRight size={16} />
          </button>
        </div>
        <p className="landing-meta">
          Also available as{' '}
          <a href={ZIP_HREF} download>Mac ZIP</a>
          {' '}· files land in project <code>Downloads/</code> and <code>~/Downloads</code>
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
          <p>Higgsfield-ready board generation and cinematic coaching for Pro/Elite tiers.</p>
        </article>
      </section>

      <section className="landing-download-panel" id="download">
        <h3>macOS download</h3>
        <div className="download-rows">
          <div className="download-row">
            <div>
              <strong>Neo-Chess-1.0.0-mac.dmg</strong>
              <p>Mount → drag Neo Chess.app to Applications → Open</p>
            </div>
            <a className="primary-btn" href={DMG_HREF} download>Download DMG</a>
          </div>
          <div className="download-row">
            <div>
              <strong>Neo-Chess-1.0.0-mac.zip</strong>
              <p>Fallback package with the same Mac app + landing page.</p>
            </div>
            <a className="ghost-cta" href={ZIP_HREF} download>Download ZIP</a>
          </div>
        </div>
      </section>
    </div>
  );
}
