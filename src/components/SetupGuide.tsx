import { KEY_SITES, LOCAL_MAC_STEPS } from '../data/setupGuide';
import { downloadAndOpenLocalMacDmg, localMacDownloadLabel } from '../lib/macDownload';
import { ExternalLink, Download, KeyRound, ListOrdered } from 'lucide-react';

interface SetupGuideProps {
  compact?: boolean;
  showDownloadCta?: boolean;
}

export function SetupGuide({ compact = false, showDownloadCta = true }: SetupGuideProps) {
  return (
    <section className={`setup-guide ${compact ? 'compact' : ''}`} aria-labelledby="setup-guide-title">
      <header className="setup-guide-header">
        <ListOrdered size={22} />
        <div>
          <h3 id="setup-guide-title">Local Mac setup — clear steps</h3>
          <p>Packages always go to <code>~/Downloads</code> on this Mac for now. Keys stay server-side.</p>
        </div>
      </header>

      {showDownloadCta && (
        <div className="setup-download-cta">
          <button type="button" className="primary-btn" onClick={() => void downloadAndOpenLocalMacDmg()}>
            <Download size={16} /> Refresh &amp; open Mac DMG
          </button>
          <span className="setup-hint">{localMacDownloadLabel()}</span>
        </div>
      )}

      <ol className="setup-steps">
        {LOCAL_MAC_STEPS.map((step) => (
          <li key={step.id}>
            <strong>{step.title}</strong>
            <p>{step.body}</p>
            {step.code && (
              <pre className="setup-code"><code>{step.code}</code></pre>
            )}
            {step.links && step.links.length > 0 && (
              <ul className="setup-links">
                {step.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={12} /> {link.label}
                    </a>
                    {link.note && <span className="link-note"> — {link.note}</span>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>

      <div className="key-sites">
        <h4><KeyRound size={16} /> Key sites</h4>
        <ul className="setup-links">
          {KEY_SITES.map((site) => (
            <li key={site.url}>
              <a href={site.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink size={12} /> {site.label}
              </a>
              {site.note && <span className="link-note"> — {site.note}</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
