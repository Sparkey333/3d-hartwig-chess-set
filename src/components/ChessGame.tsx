import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { Cpu, FlipVertical, RotateCcw, Flag, Lightbulb, Sparkles } from 'lucide-react';
import type { VariantId } from '../types';
import { TIME_CONTROLS, VARIANTS } from '../data/constants';
import { HANDICAPS } from '../data/themes';
import {
  createGame,
  tryMove,
  tryCrazyhouseDrop,
  getGameResult,
  formatTime,
  squareHeat,
  fogDisplayFen,
  type ExtendedGameState,
} from '../lib/chessEngine';
import { initStockfish, getBestMove, analyzePosition, isEngineReady } from '../lib/stockfish';
import { generateCoachNotes } from '../services/higgsfield';
import { AnalysisPanel } from './AnalysisPanel';
import { useSettings } from '../context/SettingsContext';

type BoardSquare = `${'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'}${1|2|3|4|5|6|7|8}`;

interface ChessGameProps {
  variant: VariantId;
  onExit: () => void;
}

export function ChessGame({ variant, onExit }: ChessGameProps) {
  const variantDef = VARIANTS.find((v) => v.id === variant)!;
  const { activeBoardTheme, handicapId } = useSettings();
  const handicap = HANDICAPS.find((h) => h.id === handicapId) ?? HANDICAPS[0];

  const [state, setState] = useState<ExtendedGameState>(() =>
    createGame(variant, { removeSquare: (handicap.pieceOdds as BoardSquare | null) ?? null }),
  );
  const [orientation, setOrientation] = useState<'white' | 'black'>('white');
  const [vsEngine, setVsEngine] = useState(true);
  const [engineLevel, setEngineLevel] = useState(5);
  const [timeControl] = useState(TIME_CONTROLS[2]);
  const [whiteTime, setWhiteTime] = useState(timeControl.initial);
  const [blackTime, setBlackTime] = useState(timeControl.initial + (handicap.timeOddsSeconds || 0));
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [engineLines, setEngineLines] = useState<{ depth: number; score: number; pv: string }[]>([]);
  const [dropPiece, setDropPiece] = useState<string | null>(null);
  const [coachNotes, setCoachNotes] = useState<string[]>([]);

  const trueFen = state.chess.fen();
  const displayFen = variant === 'neoFog' ? fogDisplayFen(state, 'w') : trueFen;

  useEffect(() => {
    initStockfish();
  }, []);

  useEffect(() => {
    if (showAnalysis && isEngineReady()) {
      analyzePosition(trueFen, (lines) => setEngineLines(lines), 16);
    }
  }, [trueFen, showAnalysis]);

  useEffect(() => {
    if (gameOver || timeControl.initial === 0) return;
    const interval = setInterval(() => {
      if (state.chess.turn() === 'w') setWhiteTime((t) => Math.max(0, t - 1));
      else setBlackTime((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [state.chess, gameOver, timeControl.initial]);

  const boardColors = useMemo(
    () => ({
      light: activeBoardTheme.lightSquare,
      dark: activeBoardTheme.darkSquare,
    }),
    [activeBoardTheme],
  );

  const heatSquareStyles = useMemo(() => {
    if (variant !== 'neoPulse') return {};
    const styles: Record<string, CSSProperties> = {};
    for (const sq of [
      'a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2',
      'a3','b3','c3','d3','e3','f3','g3','h3','a4','b4','c4','d4','e4','f4','g4','h4',
      'a5','b5','c5','d5','e5','f5','g5','h5','a6','b6','c6','d6','e6','f6','g6','h6',
      'a7','b7','c7','d7','e7','f7','g7','h7','a8','b8','c8','d8','e8','f8','g8','h8',
    ] as BoardSquare[]) {
      const heat = squareHeat(state.chess, sq);
      if (heat > 0.1) {
        styles[sq] = {
          background: `radial-gradient(circle, rgba(239,68,68,${heat * 0.45}) 0%, transparent 70%)`,
        };
      }
    }
    return styles;
  }, [state.chess, variant]);

  const themedSquares = useMemo(() => {
    const styles: Record<string, CSSProperties> = { ...heatSquareStyles };
    for (const sq of [
      'a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2',
      'a3','b3','c3','d3','e3','f3','g3','h3','a4','b4','c4','d4','e4','f4','g4','h4',
      'a5','b5','c5','d5','e5','f5','g5','h5','a6','b6','c6','d6','e6','f6','g6','h6',
      'a7','b7','c7','d7','e7','f7','g7','h7','a8','b8','c8','d8','e8','f8','g8','h8',
    ] as BoardSquare[]) {
      const file = sq.charCodeAt(0) - 97;
      const rank = parseInt(sq[1], 10);
      const isLight = (file + rank) % 2 === 1;
      styles[sq] = {
        ...(styles[sq] ?? {}),
        backgroundColor: isLight ? boardColors.light : boardColors.dark,
      };
    }
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        boxShadow: `inset 0 0 0 3px ${activeBoardTheme.highlight}`,
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        boxShadow: `inset 0 0 0 4px ${activeBoardTheme.highlight}`,
      };
    }
    return styles;
  }, [heatSquareStyles, boardColors, lastMove, activeBoardTheme.highlight]);

  const makeEngineMove = useCallback(async (currentState: ExtendedGameState) => {
    const move = await getBestMove(currentState.chess.fen(), engineLevel);
    if (!move || move.length < 4) return;
    const from = move.slice(0, 2) as BoardSquare;
    const to = move.slice(2, 4) as BoardSquare;
    const promo = move.length > 4 ? move[4] : undefined;
    const result = tryMove(currentState, from, to, promo, variant);
    if (result.ok) {
      setState(result.state);
      setLastMove({ from, to });
      if (timeControl.increment) setBlackTime((t) => t + timeControl.increment);
      const end = getGameResult(result.state, variant) ?? result.special ?? null;
      if (end) setGameOver(end);
    }
  }, [engineLevel, variant, timeControl.increment]);

  const onDrop = useCallback(({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (!targetSquare || gameOver) return false;
    if (vsEngine && state.chess.turn() === 'b') return false;

    if (variant === 'crazyhouse' && dropPiece && sourceSquare === targetSquare) {
      return false;
    }

    const result = tryMove(state, sourceSquare as BoardSquare, targetSquare as BoardSquare, 'q', variant);
    if (!result.ok) return false;

    setState(result.state);
    setLastMove({ from: sourceSquare, to: targetSquare });
    setDropPiece(null);
    if (timeControl.increment) {
      if (state.chess.turn() === 'w') setWhiteTime((t) => t + timeControl.increment);
      else setBlackTime((t) => t + timeControl.increment);
    }

    const end = getGameResult(result.state, variant) ?? result.special ?? null;
    if (end) {
      setGameOver(end);
      return true;
    }

    if (vsEngine && result.state.chess.turn() === 'b') {
      setTimeout(() => makeEngineMove(result.state), 300);
    }
    return true;
  }, [state, gameOver, vsEngine, variant, timeControl.increment, makeEngineMove, dropPiece]);

  const onSquareClick = useCallback(({ square }: { square: string }) => {
    if (!dropPiece || variant !== 'crazyhouse' || gameOver) return;
    if (state.chess.turn() !== 'w') return;
    const result = tryCrazyhouseDrop(state, dropPiece, square as BoardSquare, 'w');
    if (!result.ok) return;
    setState(result.state);
    setLastMove({ from: square, to: square });
    setDropPiece(null);
    const end = getGameResult(result.state, variant);
    if (end) setGameOver(end);
    else if (vsEngine) setTimeout(() => makeEngineMove(result.state), 300);
  }, [dropPiece, variant, gameOver, state, vsEngine, makeEngineMove]);

  const resetGame = () => {
    setState(createGame(variant, { removeSquare: (handicap.pieceOdds as BoardSquare | null) ?? null }));
    setGameOver(null);
    setLastMove(null);
    setWhiteTime(timeControl.initial);
    setBlackTime(timeControl.initial + (handicap.timeOddsSeconds || 0));
    setDropPiece(null);
    setCoachNotes([]);
  };

  const askCoach = async () => {
    const res = await generateCoachNotes({
      fen: trueFen,
      pgn: state.chess.history().join(' '),
    });
    setCoachNotes(res.notes);
  };

  const pieceLabel = (p: string) => ({ p: '♟', n: '♞', b: '♝', r: '♜', q: '♛' }[p] ?? p);

  return (
    <div className="game-layout" style={{ ['--board-accent' as string]: activeBoardTheme.highlight }}>
      <div className="game-sidebar">
        <div className="game-meta">
          <span className={`mode-badge mode-${variantDef.mode}`}>{variantDef.mode}</span>
          <h2>{variantDef.name}</h2>
          <p>{variantDef.tagline}</p>
          <p className="theme-chip">Theme: {activeBoardTheme.name}</p>
          {handicapId !== 'none' && <p className="theme-chip">Handicap: {handicap.label}</p>}
        </div>

        <div className="clock-panel">
          <div className={`clock ${state.chess.turn() === 'b' ? 'active' : ''}`}>
            <span>Black</span>
            <strong>{timeControl.initial ? formatTime(blackTime) : '∞'}</strong>
          </div>
          <div className={`clock ${state.chess.turn() === 'w' ? 'active' : ''}`}>
            <span>White</span>
            <strong>{timeControl.initial ? formatTime(whiteTime) : '∞'}</strong>
          </div>
        </div>

        {variant === 'threeCheck' && (
          <div className="check-counter">
            <div>White checks: {state.checksWhite}/3</div>
            <div>Black checks: {state.checksBlack}/3</div>
          </div>
        )}

        {variant === 'crazyhouse' && (
          <div className="reserve-panel">
            <h3>Reserves (drop)</h3>
            <div className="reserve-row">
              {state.crazyhouseReserves.w.length === 0 && <span className="muted">Empty</span>}
              {state.crazyhouseReserves.w.map((p, i) => (
                <button
                  key={`${p}-${i}`}
                  type="button"
                  className={`reserve-piece ${dropPiece === p ? 'selected' : ''}`}
                  onClick={() => setDropPiece(dropPiece === p ? null : p)}
                >
                  {pieceLabel(p)}
                </button>
              ))}
            </div>
            <p className="muted">Select a piece, then click an empty square.</p>
          </div>
        )}

        <div className="move-history">
          <h3>Moves</h3>
          <ol>
            {state.chess.history().map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ol>
        </div>

        <div className="engine-controls">
          <label className="toggle">
            <input type="checkbox" checked={vsEngine} onChange={(e) => setVsEngine(e.target.checked)} />
            <Cpu size={16} /> vs Stockfish
          </label>
          {vsEngine && (
            <label>
              Skill: {engineLevel}
              <input type="range" min={0} max={20} value={engineLevel} onChange={(e) => setEngineLevel(+e.target.value)} />
            </label>
          )}
        </div>

        <div className="game-actions">
          <button type="button" onClick={() => setOrientation((o) => (o === 'white' ? 'black' : 'white'))}>
            <FlipVertical size={16} /> Flip
          </button>
          <button type="button" onClick={resetGame}><RotateCcw size={16} /> Reset</button>
          <button type="button" onClick={() => setShowAnalysis(!showAnalysis)}>
            <Lightbulb size={16} /> Analysis
          </button>
          <button type="button" onClick={askCoach}><Sparkles size={16} /> Coach</button>
          <button type="button" className="danger" onClick={() => setGameOver('White wins by resignation')}>
            <Flag size={16} /> Resign
          </button>
          <button type="button" className="ghost" onClick={onExit}>← Lobby</button>
        </div>

        {coachNotes.length > 0 && (
          <div className="coach-box">
            <h3>Neo Coach</h3>
            <ul>{coachNotes.map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        )}

        {gameOver && <div className="game-over-banner">{gameOver}</div>}
      </div>

      <div className="board-area">
        <Chessboard
          options={{
            position: displayFen,
            boardOrientation: orientation,
            onPieceDrop: onDrop,
            onSquareClick,
            squareStyles: themedSquares,
            animationDurationInMs: variantDef.mode === 'neo' ? 180 : 120,
            showNotation: true,
            allowDragging: !gameOver && !(variant === 'crazyhouse' && dropPiece),
          }}
        />
        {variant === 'neoFog' && <div className="fog-overlay" aria-hidden="true" />}
        {variant === 'neoGravity' && <div className="gravity-overlay" aria-hidden="true" />}
      </div>

      {showAnalysis && (
        <AnalysisPanel lines={engineLines} fen={trueFen} onClose={() => setShowAnalysis(false)} />
      )}
    </div>
  );
}
