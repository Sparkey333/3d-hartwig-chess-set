import { useState } from 'react';
import { Lock, Sparkles, Wand2, Zap } from 'lucide-react';
import { PREMIUM_FEATURES } from '../data/constants';
import { generateBoardTheme } from '../services/higgsfield';

export function PremiumView() {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    const result = await generateBoardTheme({ prompt, style: 'neo' });
    setGeneratedPreview(result.description);
    setGenerating(false);
  };

  const proFeatures = PREMIUM_FEATURES.filter((f) => f.tier === 'pro');
  const eliteFeatures = PREMIUM_FEATURES.filter((f) => f.tier === 'elite');

  return (
    <div className="premium-view">
      <header className="premium-hero">
        <Sparkles size={32} />
        <h2>Neo Premium</h2>
        <p>
          AI-powered features that no other chess app combines — board generation, cinematic replays,
          and personalized coaching via Higgsfield AI, plus deep Stockfish analysis.
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
        <h3><Wand2 size={20} /> Higgsfield AI Board Generator</h3>
        <p>Describe your dream board — our AI creates custom themes and piece sets.</p>
        <div className="generator-box">
          <textarea
            placeholder="e.g. Cyberpunk neon board with holographic glass pieces, rain-slick reflections…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
          />
          <button type="button" className="primary-btn" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate Preview'}
          </button>
        </div>
        {generatedPreview && (
          <div className="ai-preview">
            <div className="preview-placeholder">
              <Zap size={48} />
              <p>{generatedPreview}</p>
            </div>
          </div>
        )}
        <p className="api-note">
          Set <code>HIGGSFIELD_API_KEY</code> in your environment to enable live Higgsfield AI generation.
        </p>
      </section>

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
