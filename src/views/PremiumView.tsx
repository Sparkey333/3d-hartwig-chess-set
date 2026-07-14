import { useEffect, useState } from 'react';
import { Lock, Sparkles, Wand2, Zap, RefreshCw, Check } from 'lucide-react';
import { PREMIUM_FEATURES } from '../data/constants';
import { generateBoardTheme, generateGameReplay, getAiStatus, type AiStatus } from '../services/higgsfield';
import { useSettings, type AiProviderId } from '../context/SettingsContext';
import type { BoardTheme } from '../data/themes';

export function PremiumView({ onGotoSetup }: { onGotoSetup?: () => void }) {
  const { aiProvider, setAiProvider, applyCustomTheme, activeBoardTheme } = useSettings();
  const [prompt, setPrompt] = useState('Obsidian glass chessboard with teal edge lighting, Colorado night sky reflection');
  const [style, setStyle] = useState<'traditional' | 'neo' | 'competition'>('neo');
  const [generating, setGenerating] = useState(false);
  const [resultDesc, setResultDesc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [replayMsg, setReplayMsg] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    getAiStatus().then(setStatus);
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setApplied(false);
    const result = await generateBoardTheme({ prompt, style, provider: aiProvider });
    setResultDesc(result.description);
    setPreviewUrl(result.previewUrl ?? null);
    const theme: BoardTheme = {
      id: 'ai-custom',
      name: 'AI Custom',
      tagline: `${result.provider} · ${result.mode}`,
      lightSquare: result.themeConfig.lightSquare,
      darkSquare: result.themeConfig.darkSquare,
      highlight: result.themeConfig.highlightColor,
      source: 'ai',
      textureHint: result.themeConfig.boardTexture,
    };
    applyCustomTheme(theme);
    setApplied(true);
    setGenerating(false);
  };

  const handleReplay = async () => {
    const res = await generateGameReplay('1.e4 e5 2.Nf3 Nc6 3.Bb5 a6');
    setReplayMsg(res.description);
  };

  const proFeatures = PREMIUM_FEATURES.map((f) =>
    f.id === 'ai-board-skin' || f.id === 'ai-coach' || f.id === 'puzzle-gen' || f.id === 'deep-analysis'
      ? { ...f, available: true }
      : f,
  );
  const elite = proFeatures.filter((f) => f.tier === 'elite');
  const pro = proFeatures.filter((f) => f.tier === 'pro');

  return (
    <div className="premium-view">
      <header className="premium-hero">
        <Sparkles size={32} />
        <h2>Neo Premium</h2>
        <p>
          Higgsfield-first creative pipeline with OpenAI image + procedural fallbacks —
          generate board skins, coach notes, and cinematic replay stubs that sell the Neo spin.
        </p>
        <div className="provider-status">
          <span className={status?.higgsfield ? 'on' : 'off'}>Higgsfield {status?.higgsfield ? 'ready' : 'offline'}</span>
          <span className={status?.openai ? 'on' : 'off'}>OpenAI {status?.openai ? 'ready' : 'offline'}</span>
          <span className="on">Procedural always-on</span>
        </div>
      </header>

      <section className="ai-generator">
        <h3><Wand2 size={20} /> Multi-provider Board Studio</h3>
        <p>Primary: Higgsfield Soul/FLUX. Alternatives: OpenAI Images · local procedural palette (instant).</p>
        <div className="provider-row">
          {([
            ['auto', 'Auto'],
            ['higgsfield', 'Higgsfield'],
            ['openai', 'OpenAI'],
            ['procedural', 'Procedural'],
          ] as [AiProviderId, string][]).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip ${aiProvider === id ? 'active' : ''}`}
              onClick={() => setAiProvider(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="provider-row">
          {(['traditional', 'competition', 'neo'] as const).map((s) => (
            <button key={s} type="button" className={`chip ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>
              {s}
            </button>
          ))}
        </div>
        <div className="generator-box">
          <textarea
            placeholder="Describe board / piece aesthetic…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <button type="button" className="primary-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? <><RefreshCw size={16} className="spin" /> Generating…</> : 'Generate & Apply Theme'}
          </button>
        </div>
        {(resultDesc || previewUrl) && (
          <div className="ai-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="AI board preview" className="ai-preview-img" />
            ) : (
              <div
                className="theme-swatch"
                style={{
                  background: `linear-gradient(135deg, ${activeBoardTheme.lightSquare}, ${activeBoardTheme.darkSquare})`,
                }}
              />
            )}
            <div>
              <p>{resultDesc}</p>
              {applied && (
                <p className="applied-msg"><Check size={14} /> Applied — live on Play board ({activeBoardTheme.lightSquare} / {activeBoardTheme.darkSquare})</p>
              )}
            </div>
          </div>
        )}
        <div className="replay-row">
          <button type="button" className="ghost-cta" onClick={handleReplay}>
            <Zap size={16} /> Stage cinematic replay (Higgsfield image→video)
          </button>
          {replayMsg && <p className="muted">{replayMsg}</p>}
        </div>
        <p className="api-note">
          Need keys?{' '}
          <a href="https://cloud.higgsfield.ai/" target="_blank" rel="noopener noreferrer">Higgsfield Cloud</a>
          {' · '}
          <a href="https://docs.higgsfield.ai" target="_blank" rel="noopener noreferrer">API Docs</a>
          {' · '}
          <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Keys</a>
          {' · '}
          {onGotoSetup ? (
            <button type="button" className="linkish" onClick={onGotoSetup}>Open Setup tab</button>
          ) : (
            <span>Setup tab</span>
          )}
          <br />
          Server: <code>npm run ai:proxy</code> · Env: <code>HF_CREDENTIALS</code> or <code>OPENAI_API_KEY</code>
        </p>
      </section>

      <section className="feature-grid">
        <h3>Pro Features</h3>
        <div className="features">
          {pro.map((f) => (
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
          {elite.map((f) => (
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
