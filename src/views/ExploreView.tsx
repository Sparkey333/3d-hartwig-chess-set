import { useMemo, useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { Search, BookOpen } from 'lucide-react';
import { OPENINGS } from '../data/openings';
import { useSettings } from '../context/SettingsContext';

export function ExploreView() {
  const { activeBoardTheme } = useSettings();
  const [query, setQuery] = useState('');
  const [style, setStyle] = useState<'all' | 'classical' | 'aggressive' | 'positional' | 'uncommon'>('all');
  const [selected, setSelected] = useState(OPENINGS[0]);

  const filtered = useMemo(() => {
    return OPENINGS.filter((o) => {
      const q = query.toLowerCase();
      const matchQ = !q || o.name.toLowerCase().includes(q) || o.eco.toLowerCase().includes(q) || o.moves.includes(q);
      const matchS = style === 'all' || o.style === style;
      return matchQ && matchS;
    }).sort((a, b) => b.popularity - a.popularity);
  }, [query, style]);

  const squareStyles = useMemo(() => {
    const styles: Record<string, CSSProperties> = {};
    for (let r = 1; r <= 8; r++) {
      for (const f of 'abcdefgh') {
        const sq = `${f}${r}`;
        const isLight = (f.charCodeAt(0) - 97 + r) % 2 === 1;
        styles[sq] = {
          backgroundColor: isLight ? activeBoardTheme.lightSquare : activeBoardTheme.darkSquare,
        };
      }
    }
    return styles;
  }, [activeBoardTheme]);

  return (
    <div className="explore-view">
      <header>
        <h2>Opening Explorer</h2>
        <p>
          Unified opening lab seed — addresses Chess.com/Lichess feedback for one place to browse
          common + uncommon lines. Premium Opening Lab AI personalizes this from your games.
        </p>
      </header>

      <div className="search-bar">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search ECO, name, or moves…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-chips">
        {(['all', 'classical', 'aggressive', 'positional', 'uncommon'] as const).map((s) => (
          <button key={s} type="button" className={`chip ${style === s ? 'active' : ''}`} onClick={() => setStyle(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="explore-layout">
        <div className="opening-list">
          {filtered.map((o) => (
            <button
              key={o.eco + o.name}
              type="button"
              className={`opening-row ${selected.eco === o.eco && selected.name === o.name ? 'selected' : ''}`}
              onClick={() => setSelected(o)}
            >
              <span className="eco">{o.eco}</span>
              <span>
                <strong>{o.name}</strong>
                <p>{o.moves}</p>
              </span>
              <span className="pop">{o.popularity}%</span>
            </button>
          ))}
        </div>
        <aside className="opening-detail">
          <div className="board-area">
            <Chessboard options={{ position: selected.fen, squareStyles, allowDragging: false, showNotation: true }} />
          </div>
          <h3><BookOpen size={16} /> {selected.name}</h3>
          <p className="muted">{selected.moves}</p>
          <p>Style: {selected.style} · Popularity score {selected.popularity}</p>
        </aside>
      </div>
    </div>
  );
}
