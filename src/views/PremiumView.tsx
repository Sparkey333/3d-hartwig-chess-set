import { useEffect, useState } from 'react';
import { Lock, Sparkles, Wand2, Zap, Palette, Check } from 'lucide-react';
import { PREMIUM_FEATURES } from '../data/constants';
import {
  generateBoardTheme,
  generateOpponentAvatar,
  type ThemeProvider,
} from '../services/higgsfield';
import {
  listCuratedThemes,
  loadActiveTheme,
  saveActiveTheme,
  type BoardThemeConfig,
} from '../services/themeAlternatives';
import { SetupGuide } from '../components/SetupGuide';

export function PremiumView() {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<'traditional' | 'neo' | 'competition'>('neo');
  const [provider, setProvider] = useState<ThemeProvider>('auto');
  const [curatedId, setCuratedId] = useState('neoGlass');
  const [generating, setGenerating] = useState(false);
  const [description, setDescription] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [theme, setTheme] = useState<BoardThemeConfig | null>(() => loadActiveTheme());
  const [avatarDesc, setAvatarDesc] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  const curated = listCuratedThemes();
  const proFeatures = PREMIUM_FEATURES.filter((f) => f.tier === 'pro');
  const eliteFeatures = PREMIUM_FEATURES.filter((f) => f.tier === 'elite');

  useEffect(() => {
    if (!theme) return;
    document.documentElement.style.setProperty('--board-light', theme.lightSquare);
    document.documentElement.style.setProperty('--board-dark', theme.darkSquare);
    document.documentElement.style.setProperty('--board-highlight', theme.highlightColor);
    if (theme.accent) {
      document.documentElement.style.setProperty('--accent', theme.accent);
    }
  }, [theme]);

  const handleGenerate = async () => {
    if (provider !== 'curated' && !prompt.trim()) return;
    setGenerating(true);
    setApplied(false);
    const result = await generateBoardTheme({
      prompt,
      style,
      provider,
      curatedId: provider === 'curated' ? curatedId : undefined,
    });
    setDescription(result.description);
    setPreviewUrl(result.previewUrl ?? null);
    setTheme(result.themeConfig);
    setGenerating(false);
  };

  const handleApply = () => {
    if (!theme) return;
    saveActiveTheme(theme);
    setApplied(true);
  };

  const handleAvatar = async () => {
    setGenerating(true);
    const result = await generateOpponentAvatar(prompt || 'stoic grandmaster rival');
    setAvatarDesc(result.description);
    setAvatarUrl(result.previewUrl ?? null);
    setGenerating(false);
  };

  return (
    <div className="premium-view">
      <header className="premium-hero">
        <Sparkles size={32} />
        <h2>Neo Premium</h2>
        <p>
          AI-powered boards via Higgsfield (server proxy) with offline procedural and curated
          Hartwig-inspired alternatives when no API key is set.
        </p>
        <div className="pricing-cards">
          <div className="price-card">
            <h3>Pro</h3>
            <p className="price">$4.99<span>/mo</span></p>
            <ul>
              <li>Deep Stockfish analysis</li>
              <li>AI board skin generator</li>
              <li>Neo Coach game review</li>
              <li>Infinite puzzle generator</li>
            </ul>
            <button type="button" className="primary-btn">Start Pro Trial</button>
          </div>
          <div className="price-card featured">
            <h3>Elite</h3>
            <p className="price">$9.99<span>/mo</span></p>
            <ul>
              <li>Everything in Pro</li>
              <li>Opening Lab AI</li>
              <li>Custom variant builder</li>
              <li>AI opponent avatars</li>
              <li>Cinematic game replays</li>
            </ul>
            <button type="button" className="primary-btn">Start Elite Trial</button>
          </div>
        </div>
      </header>

      <section className="ai-generator">
        <h3><Wand2 size={20} /> Board Theme Studio</h3>
        <p>
          Providers: <strong>Auto</strong> (Higgsfield → procedural fallback),{' '}
          <strong>Higgsfield</strong> (FLUX via server proxy),{' '}
          <strong>Procedural</strong> (offline), <strong>Curated</strong> (legacy Hartwig skins).
        </p>

        <div className="provider-row" role="group" aria-label="Theme provider">
          {(['auto', 'higgsfield', 'procedural', 'curated'] as ThemeProvider[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`chip ${provider === p ? 'active' : ''}`}
              onClick={() => setProvider(p)}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="provider-row" role="group" aria-label="Style">
          {(['traditional', 'neo', 'competition'] as const).map((s) => (
            <button
              key={s}
              type="button"
              className={`chip ${style === s ? 'active' : ''}`}
              onClick={() => setStyle(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {provider === 'curated' && (
          <div className="provider-row" role="listbox" aria-label="Curated skins">
            {curated.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`chip ${curatedId === c.id ? 'active' : ''}`}
                onClick={() => setCuratedId(c.id)}
              >
                <Palette size={14} /> {c.label}
              </button>
            ))}
          </div>
        )}

        <div className="generator-box">
          <textarea
            placeholder="e.g. Cyberpunk neon board with holographic glass pieces, rain-slick reflections…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            disabled={provider === 'curated'}
            aria-label="Board theme prompt"
          />
          <div className="generator-actions">
            <button type="button" className="primary-btn" onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating…' : 'Generate Theme'}
            </button>
            <button type="button" className="ghost" onClick={handleAvatar} disabled={generating}>
              Generate Avatar
            </button>
            {theme && (
              <button type="button" className="primary-btn" onClick={handleApply}>
                {applied ? <><Check size={16} /> Applied</> : 'Apply to Games'}
              </button>
            )}
          </div>
        </div>

        {theme && (
          <div className="theme-swatch" aria-label="Theme preview swatches">
            <div className="swatch" style={{ background: theme.lightSquare }} title="Light square" />
            <div className="swatch" style={{ background: theme.darkSquare }} title="Dark square" />
            <div className="swatch" style={{ background: theme.highlightColor }} title="Highlight" />
            <div className="mini-board" style={{ background: theme.background }}>
              {Array.from({ length: 8 }, (_, r) =>
                Array.from({ length: 8 }, (_, c) => (
                  <span
                    key={`${r}-${c}`}
                    style={{
                      background: (r + c) % 2 === 0 ? theme.lightSquare : theme.darkSquare,
                    }}
                  />
                )),
              )}
            </div>
            <div className="theme-meta">
              <strong>{theme.boardLabel}</strong>
              <span>{theme.pieceStyle}</span>
            </div>
          </div>
        )}

        {description && (
          <div className="ai-preview">
            <div className="preview-placeholder">
              {previewUrl ? (
                <img src={previewUrl} alt="Generated board theme" className="ai-preview-img" />
              ) : (
                <Zap size={48} />
              )}
              <p>{description}</p>
            </div>
          </div>
        )}

        {(avatarDesc || avatarUrl) && (
          <div className="ai-preview">
            <div className="preview-placeholder">
              {avatarUrl && <img src={avatarUrl} alt="Opponent avatar" className="ai-preview-img" />}
              <p>{avatarDesc}</p>
            </div>
          </div>
        )}

        <p className="api-note">
          Live Higgsfield uses server env <code>HF_CREDENTIALS=KEY_ID:KEY_SECRET</code> from{' '}
          <a href="https://cloud.higgsfield.ai" target="_blank" rel="noopener noreferrer">
            cloud.higgsfield.ai
          </a>{' '}
          (never <code>VITE_*</code>). Docs:{' '}
          <a href="https://docs.higgsfield.ai" target="_blank" rel="noopener noreferrer">
            docs.higgsfield.ai
          </a>
          . Without credentials, Auto/Procedural/Curated still work offline on this Mac.
        </p>
      </section>

      <SetupGuide compact />

      <section className="feature-grid">
        <h3>Pro Features</h3>
        <div className="features">
          {proFeatures.map((f) => (
            <article key={f.id} className={`feature-card ${f.available ? 'available' : 'locked'}`}>
              {!f.available && <Lock size={16} className="lock-icon" />}
              <h4>{f.title}</h4>
              <p>{f.description}</p>
              <span className="provider-tag">{f.provider}</span>
            </article>
          ))}
        </div>

        <h3>Elite Features</h3>
        <div className="features">
          {eliteFeatures.map((f) => (
            <article key={f.id} className={`feature-card ${f.available ? 'available' : 'locked'}`}>
              {!f.available && <Lock size={16} className="lock-icon" />}
              <h4>{f.title}</h4>
              <p>{f.description}</p>
              <span className="provider-tag">{f.provider}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
