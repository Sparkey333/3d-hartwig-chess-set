import { Download, ArrowRight, Sparkles, MapPin, Crown, KeyRound } from 'lucide-react';
import { DMG_FILE, ZIP_FILE, MAC_INSTALL_STEPS } from '../data/setup';

interface LandingViewProps {
  onPlay: () => void;
  onDownloadFocus: () => void;
  onSetup: () => void;
}

const DMG_HREF = `/downloads/${DMG_FILE}`;
const ZIP_HREF = `/downloads/${ZIP_FILE}`;

export function LandingView({ onPlay, onSetup }: LandingViewProps) {
  return (
    <div className="landing-view">
      <section className="landing-hero">
        <p className="landing-brand">Neo Chess</p>
        <h2>
          Traditional. Competition.
          <span> Neo.</span>
        </h2>
        <p className="landing-lede">
          Chess for this local Mac — Stockfish analysis, Colorado club search, and Higgsfield Premium AI.
          Download the DMG to your Downloads folder, then follow Setup for API keys.
        </p>
        <div className="landing-ctas">
          <a className="primary-btn large" href={DMG_HREF} download>
            <Download size={18} /> Download Mac DMG
          </a>
          <button type="button" className="ghost-cta" onClick={onSetup}>
            <KeyRound size={16} /> Setup &amp; API keys
          </button>
          <button type="button" className="ghost-cta" onClick={onPlay}>
            Play in browser <ArrowRight size={16} />
          </button>
        </div>
        <p className="landing-meta">
          Target: <strong>this Mac</strong> · files in <code>./Downloads</code> and <code>~/Downloads</code>
          {' '}· ZIP: <a href={ZIP_HREF} download>{ZIP_FILE}</a>
        </p>
      </section>

      <section className="landing-download-panel" id="download">
        <h3>Install on this Mac — 4 steps</h3>
        <ol className="setup-steps compact">
          {MAC_INSTALL_STEPS.map((s) => (
            <li key={s.n}>
              <span className="step-n">{s.n}</span>
              <div>
                <strong>{s.title}</strong>
                <p>{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="download-rows" style={{ marginTop: '1rem' }}>
          <div className="download-row">
            <div>
              <strong>{DMG_FILE}</strong>
              <p>Mount → drag Neo Chess.app to Applications → Open</p>
            </div>
            <a className="primary-btn" href={DMG_HREF} download>Download DMG</a>
          </div>
          <div className="download-row">
            <div>
              <strong>{ZIP_FILE}</strong>
              <p>Same app + SETUP / landing docs if DMG is blocked.</p>
            </div>
            <a className="ghost-cta" href={ZIP_HREF} download>Download ZIP</a>
          </div>
        </div>
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
            Keys:{' '}
            <a href="https://cloud.higgsfield.ai/" target="_blank" rel="noopener noreferrer">Higgsfield Cloud</a>
            {' · '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Keys</a>
          </p>
        </article>
      </section>
    </div>
  );
}
