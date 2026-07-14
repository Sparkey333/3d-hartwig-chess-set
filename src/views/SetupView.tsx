import { ExternalLink, KeyRound, Download, Terminal, MapPin } from 'lucide-react';
import {
  KEY_LINKS,
  MAC_INSTALL_STEPS,
  AI_KEY_STEPS,
  LOCAL_DEV_STEPS,
  linkById,
  DMG_FILE,
  ZIP_FILE,
} from '../data/setup';

function Steps({ steps }: { steps: typeof MAC_INSTALL_STEPS }) {
  return (
    <ol className="setup-steps">
      {steps.map((s) => (
        <li key={s.n}>
          <span className="step-n">{s.n}</span>
          <div>
            <strong>{s.title}</strong>
            <p>{s.detail}</p>
            {s.links && s.links.length > 0 && (
              <div className="step-links">
                {s.links.map((id) => {
                  const link = linkById(id);
                  if (!link) return null;
                  return (
                    <a key={id} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.title} <ExternalLink size={12} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function SetupView() {
  const byCat = (cat: (typeof KEY_LINKS)[number]['category']) =>
    KEY_LINKS.filter((l) => l.category === cat);

  return (
    <div className="setup-view">
      <header>
        <h2><KeyRound size={24} /> Setup · Keys · Mac Install</h2>
        <p>
          Clear steps for this local Mac — download the DMG to Downloads, install Neo Chess.app,
          then wire Higgsfield / OpenAI keys for Premium AI.
        </p>
      </header>

      <section className="setup-panel accent">
        <h3><Download size={18} /> A. Install on this Mac</h3>
        <div className="cta-row-inline">
          <a className="primary-btn" href={`/downloads/${DMG_FILE}`} download>
            Download {DMG_FILE}
          </a>
          <a className="ghost-cta" href={`/downloads/${ZIP_FILE}`} download>
            ZIP fallback
          </a>
        </div>
        <p className="muted">Packages also land in <code>./Downloads</code> and <code>~/Downloads</code> after <code>npm run pack:mac</code>.</p>
        <Steps steps={MAC_INSTALL_STEPS} />
      </section>

      <section className="setup-panel">
        <h3><KeyRound size={18} /> B. API keys for Premium AI</h3>
        <Steps steps={AI_KEY_STEPS} />
      </section>

      <section className="setup-panel">
        <h3><Terminal size={18} /> C. Local developer loop</h3>
        <Steps steps={LOCAL_DEV_STEPS} />
      </section>

      <section className="setup-panel">
        <h3><MapPin size={18} /> D. Key sites (bookmark these)</h3>
        {(
          [
            ['ai', 'AI & Premium'],
            ['colorado', 'Colorado / US Chess'],
            ['chess', 'Reference platforms'],
            ['stack', 'Open-source stack'],
          ] as const
        ).map(([cat, label]) => (
          <div key={cat} className="link-group">
            <h4>{label}</h4>
            <ul className="key-link-list">
              {byCat(cat).map((l) => (
                <li key={l.id}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    {l.title} <ExternalLink size={12} />
                  </a>
                  <p>{l.why}</p>
                  <code className="url-line">{l.url}</code>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
