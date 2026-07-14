import type { VariantId } from '../types';
import { VARIANTS } from '../data/constants';

interface VariantsViewProps {
  onSelect: (variant: VariantId) => void;
}

export function VariantsView({ onSelect }: VariantsViewProps) {
  return (
    <div className="variants-view">
      <header>
        <h2>Chess Variants Library</h2>
        <p>
          From FIDE-standard to Fischer Random, atomic explosions, and our Neo-exclusive modes.
          Inspired by Chess.com&apos;s 15+ variants and Lichess variant support.
        </p>
      </header>

      <div className="variant-list">
        {VARIANTS.map((v) => (
          <article key={v.id} className={`variant-detail mode-border-${v.mode}`}>
            <div className="variant-header">
              <div>
                <span className={`mode-badge mode-${v.mode}`}>{v.mode}</span>
                <h3>{v.name}</h3>
                <p className="tagline">{v.tagline}</p>
              </div>
              <button type="button" className="primary-btn" onClick={() => onSelect(v.id)}>
                Play
              </button>
            </div>
            <p>{v.description}</p>
            <ul>
              {v.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            {v.premium && <span className="premium-tag">Premium Feature</span>}
          </article>
        ))}
      </div>
    </div>
  );
}
