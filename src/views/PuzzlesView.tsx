import { useMemo, useState, type CSSProperties } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Lightbulb, CheckCircle2, XCircle } from 'lucide-react';
import { PUZZLES } from '../data/puzzles';
import { useSettings } from '../context/SettingsContext';

type BoardSquare = `${'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'}${1|2|3|4|5|6|7|8}`;

export function PuzzlesView() {
  const { activeBoardTheme } = useSettings();
  const [index, setIndex] = useState(0);
  const puzzle = PUZZLES[index];
  const [chess, setChess] = useState(() => new Chess(puzzle.fen));
  const [status, setStatus] = useState<'playing' | 'solved' | 'failed'>('playing');
  const [showHint, setShowHint] = useState(false);

  const resetPuzzle = (i: number) => {
    const p = PUZZLES[i];
    setIndex(i);
    setChess(new Chess(p.fen));
    setStatus('playing');
    setShowHint(false);
  };

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

  const onDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare || status !== 'playing') return false;
    const next = new Chess(chess.fen());
    try {
      next.move({ from: sourceSquare as BoardSquare, to: targetSquare as BoardSquare, promotion: 'q' });
    } catch {
      return false;
    }
    const uci = `${sourceSquare}${targetSquare}`;
    const ok = puzzle.solution.includes(uci) || puzzle.solution.some((s) => s.startsWith(uci.slice(0, 4)));
    setChess(next);
    setStatus(ok ? 'solved' : 'failed');
    return true;
  };

  return (
    <div className="puzzles-view">
      <header>
        <h2>Puzzle Arena</h2>
        <p>Offline tactical set — Lichess-style themes with Neo Coach hints. AI-generated infinite puzzles route through Premium.</p>
      </header>

      <div className="puzzle-layout">
        <div className="board-area">
          <Chessboard
            options={{
              position: chess.fen(),
              onPieceDrop: onDrop,
              squareStyles,
              allowDragging: status === 'playing',
              showNotation: true,
            }}
          />
        </div>
        <aside className="puzzle-side">
          <span className="mode-badge mode-neo">rating {puzzle.rating}</span>
          <h3>{puzzle.setup}</h3>
          <div className="filter-chips">
            {puzzle.themes.map((t) => (
              <span key={t} className="chip">{t}</span>
            ))}
          </div>
          {showHint && <p className="coach-box">{puzzle.hint}</p>}
          {status === 'solved' && (
            <p className="game-over-banner"><CheckCircle2 size={16} /> Solved</p>
          )}
          {status === 'failed' && (
            <p className="game-over-banner" style={{ borderColor: 'var(--red)', background: 'rgba(248,113,113,0.12)' }}>
              <XCircle size={16} /> Not quite — try again
            </p>
          )}
          <div className="game-actions">
            <button type="button" onClick={() => setShowHint(true)}><Lightbulb size={16} /> Hint</button>
            <button type="button" onClick={() => resetPuzzle(index)}>Retry</button>
            <button
              type="button"
              className="primary-btn"
              onClick={() => resetPuzzle((index + 1) % PUZZLES.length)}
            >
              Next puzzle
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
