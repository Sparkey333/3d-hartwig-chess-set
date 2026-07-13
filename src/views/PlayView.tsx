import { ChevronRight, Clock, Cpu, Zap } from 'lucide-react';
import type { VariantId } from '../types';
import { VARIANTS, TIME_CONTROLS } from '../data/constants';
import { ChessGame } from '../components/ChessGame';

interface PlayViewProps {
  variant: VariantId;
  showGame: boolean;
  onStartGame: (variant: VariantId) => void;
  onExitGame: () => void;
  onVariantChange: (variant: VariantId) => void;
}

export function PlayView({ variant, showGame, onStartGame, onExitGame, onVariantChange }: PlayViewProps) {
  if (showGame) {
    return <ChessGame variant={variant} onExit={onExitGame} />;
  }

  const featured = VARIANTS.filter((v) => v.popular);
  const byMode = {
    traditional: VARIANTS.filter((v) => v.mode === 'traditional'),
    competition: VARIANTS.filter((v) => v.mode === 'competition'),
    neo: VARIANTS.filter((v) => v.mode === 'neo'),
  };

  return (
    <div className="play-lobby">
      <section className="hero">
        <h2>Choose Your Battlefield</h2>
        <p>
          Neo Chess combines the best of Lichess clarity, Chess.com variants, and our own
          innovative modes — with Stockfish analysis and Colorado club integration built in.
        </p>
      </section>

      <section className="featured-row">
        <h3>Quick Start</h3>
        <div className="card-grid">
          {featured.map((v) => (
            <button key={v.id} type="button" className="game-card featured" onClick={() => onStartGame(v.id)}>
              <span className={`mode-badge mode-${v.mode}`}>{v.mode}</span>
              <h4>{v.name}</h4>
              <p>{v.tagline}</p>
              <ChevronRight className="card-arrow" size={20} />
            </button>
          ))}
        </div>
      </section>

      <section className="mode-sections">
        {(['traditional', 'competition', 'neo'] as const).map((mode) => (
          <div key={mode} className="mode-section">
            <h3 className={`mode-title mode-${mode}`}>
              {mode === 'traditional' && '♚ Traditional'}
              {mode === 'competition' && '⚔ Competition'}
              {mode === 'neo' && '✦ Neo'}
            </h3>
            <div className="card-grid compact">
              {byMode[mode].map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={`game-card ${variant === v.id ? 'selected' : ''}`}
                  onClick={() => onVariantChange(v.id)}
                >
                  <h4>{v.name}</h4>
                  <p>{v.tagline}</p>
                  {v.premium && <span className="premium-tag">Premium</span>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="play-settings">
        <h3>Game Settings</h3>
        <div className="settings-row">
          <div className="setting">
            <Clock size={18} />
            <label>
              Time Control
              <select defaultValue="blitz5">
                {TIME_CONTROLS.map((tc) => (
                  <option key={tc.id} value={tc.id}>{tc.label}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="setting">
            <Cpu size={18} />
            <span>Stockfish opponent enabled</span>
          </div>
          <div className="setting">
            <Zap size={18} />
            <span>Variant: {VARIANTS.find((v) => v.id === variant)?.name}</span>
          </div>
        </div>
        <button type="button" className="primary-btn large" onClick={() => onStartGame(variant)}>
          Start Game
        </button>
      </section>
    </div>
  );
}
