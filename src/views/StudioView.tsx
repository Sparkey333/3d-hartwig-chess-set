import { BOARD_THEMES, PIECE_SETS, HANDICAPS, useSettings } from '../context/SettingsContext';

export function StudioView() {
  const {
    boardThemeId,
    pieceSetId,
    handicapId,
    setBoardThemeId,
    setPieceSetId,
    setHandicapId,
    activeBoardTheme,
  } = useSettings();

  return (
    <div className="studio-view">
      <header>
        <h2>Asset Studio</h2>
        <p>
          Upgrade path from the Hartwig classic/marble textures plus Neo alternatives —
          themes apply live to Play, Puzzles, and Explorer boards.
        </p>
      </header>

      <section>
        <h3>Board themes</h3>
        <div className="theme-grid">
          {BOARD_THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`theme-card ${boardThemeId === t.id ? 'selected' : ''}`}
              onClick={() => setBoardThemeId(t.id)}
            >
              <div
                className="theme-preview"
                style={{ background: `linear-gradient(135deg, ${t.lightSquare} 50%, ${t.darkSquare} 50%)` }}
              />
              <strong>{t.name}</strong>
              <p>{t.tagline}</p>
              <span className="provider-tag">{t.source}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Piece set alternatives</h3>
        <div className="card-grid compact">
          {PIECE_SETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`game-card ${pieceSetId === p.id ? 'selected' : ''}`}
              onClick={() => setPieceSetId(p.id)}
            >
              <h4>{p.name}</h4>
              <p>{p.tagline}</p>
              <span className="provider-tag">{p.source}</span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h3>Handicaps (odds)</h3>
        <p className="muted">Requested by Chess.com users — time odds and piece odds for coaching / club nights.</p>
        <div className="filter-chips" style={{ marginTop: '0.75rem' }}>
          {HANDICAPS.map((h) => (
            <button
              key={h.id}
              type="button"
              className={`chip ${handicapId === h.id ? 'active' : ''}`}
              onClick={() => setHandicapId(h.id)}
            >
              {h.label}
            </button>
          ))}
        </div>
      </section>

      <section className="active-preview panel-soft">
        <h3>Active board</h3>
        <div
          className="theme-swatch large"
          style={{
            background: `linear-gradient(135deg, ${activeBoardTheme.lightSquare}, ${activeBoardTheme.darkSquare})`,
            boxShadow: `0 0 0 3px ${activeBoardTheme.highlight}`,
          }}
        />
        <p>{activeBoardTheme.name} · highlight {activeBoardTheme.highlight}</p>
      </section>
    </div>
  );
}
