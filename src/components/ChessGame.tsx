import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Chessboard } from 'react-chessboard';
import { Cpu, FlipVertical, RotateCcw, Flag, Lightbulb } from 'lucide-react';

type BoardSquare = `${'a'|'b'|'c'|'d'|'e'|'f'|'g'|'h'}${1|2|3|4|5|6|7|8}`;
import type { VariantId } from '../types';
import { TIME_CONTROLS, VARIANTS } from '../data/constants';
import {
  createGame,
  tryMove,
  getGameResult,
  formatTime,
  squareHeat,
  type ExtendedGameState,
} from '../lib/chessEngine';
import { initStockfish, getBestMove, analyzePosition, isEngineReady } from '../lib/stockfish';
import { AnalysisPanel } from './AnalysisPanel';
import { loadActiveTheme } from '../services/themeAlternatives';
import { saveGame, savePrefs, loadPrefs } from '../lib/persistence';
import { ErrorBoundary } from './ErrorBoundary';

interface ChessGameProps {
  variant: VariantId;
  onExit: () => void;
}

export function ChessGame({ variant, onExit }: ChessGameProps) {
  const variantDef = VARIANTS.find((v) => v.id === variant)!;
  const prefs = loadPrefs();
  const [state, setState] = useState<ExtendedGameState>(() => createGame(variant));
  const [orientation, setOrientation] = useState<'white' | 'black'>(prefs.orientation ?? 'white');
  const [vsEngine, setVsEngine] = useState(prefs.vsEngine ?? true);
  const [engineLevel, setEngineLevel] = useState(prefs.engineLevel ?? 5);
  const boardTheme = loadActiveTheme();
  const [timeControl] = useState(TIME_CONTROLS[2]);
  const [whiteTime, setWhiteTime] = useState(timeControl.initial);
  const [blackTime, setBlackTime] = useState(timeControl.initial);
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameOver, setGameOver] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [engineLines, setEngineLines] = useState<{ depth: number; score: number; pv: string }[]>([]);

  const fen = state.chess.fen();

  useEffect(() => {
    initStockfish();
  }, []);

  useEffect(() => {
    savePrefs({ engineLevel, vsEngine, orientation });
  }, [engineLevel, vsEngine, orientation]);

  useEffect(() => {
    saveGame({
      fen,
      variant,
      history: state.chess.history(),
      checksWhite: state.checksWhite,
      checksBlack: state.checksBlack,
      savedAt: new Date().toISOString(),
    });
  }, [fen, variant, state.checksWhite, state.checksBlack, state.chess]);

  useEffect(() => {
    if (showAnalysis && isEngineReady()) {
      analyzePosition(fen, (lines) => setEngineLines(lines), 16);
    }
  }, [fen, showAnalysis]);

  // Clock
  useEffect(() => {
    if (gameOver || timeControl.initial === 0) return;
    const interval = setInterval(() => {
      if (state.chess.turn() === 'w') {
        setWhiteTime((t) => Math.max(0, t - 1));
      } else {
        setBlackTime((t) => Math.max(0, t - 1));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [state.chess, gameOver, timeControl.initial]);

  const heatSquareStyles = useMemo(() => {
    if (variant !== 'neoPulse') return {};
    const styles: Record<string, CSSProperties> = {};
    for (const sq of ['a1','b1','c1','d1','e1','f1','g1','h1','a2','b2','c2','d2','e2','f2','g2','h2',
      'a3','b3','c3','d3','e3','f3','g3','h3','a4','b4','c4','d4','e4','f4','g4','h4',
      'a5','b5','c5','d5','e5','f5','g5','h5','a6','b6','c6','d6','e6','f6','g6','h6',
      'a7','b7','c7','d7','e7','f7','g7','h7','a8','b8','c8','d8','e8','f8','g8','h8'] as BoardSquare[]) {
      const heat = squareHeat(state.chess, sq);
      if (heat > 0.1) {
        styles[sq] = {
          background: `radial-gradient(circle, rgba(239,68,68,${heat * 0.5}) 0%, transparent 70%)`,
        };
      }
    }
    return styles;
  }, [state.chess, variant]);

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

    const result = tryMove(state, sourceSquare as BoardSquare, targetSquare as BoardSquare, 'q', variant);
    if (!result.ok) return false;

    setState(result.state);
    setLastMove({ from: sourceSquare, to: targetSquare });
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
  }, [state, gameOver, vsEngine, variant, timeControl.increment, makeEngineMove]);

  const resetGame = () => {
    setState(createGame(variant));
    setGameOver(null);
    setLastMove(null);
    setWhiteTime(timeControl.initial);
    setBlackTime(timeControl.initial);
  };

  const squareStyles = {
    ...heatSquareStyles,
    ...(lastMove ? {
      [lastMove.from]: { backgroundColor: 'rgba(255, 255, 0, 0.35)' },
      [lastMove.to]: { backgroundColor: 'rgba(255, 255, 0, 0.55)' },
    } : {}),
  };

  const boardStyles = boardTheme
    ? {
        lightSquareStyle: { backgroundColor: boardTheme.lightSquare },
        darkSquareStyle: { backgroundColor: boardTheme.darkSquare },
      }
    : {};

  return (
    <ErrorBoundary fallbackTitle="Board failed to render">
    <div className="game-layout" role="region" aria-label={`${variantDef.name} game`}>
      <div className="game-sidebar">
        <div className="game-meta">
          <span className={`mode-badge mode-${variantDef.mode}`}>{variantDef.mode}</span>
          <h2>{variantDef.name}</h2>
          <p>{variantDef.tagline}</p>
          {boardTheme && (
            <p className="theme-active-label" aria-live="polite">
              Theme: {boardTheme.boardLabel}
            </p>
          )}
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
          <div className="check-counter" aria-live="polite">
            <div>White checks: {state.checksWhite}/3</div>
            <div>Black checks: {state.checksBlack}/3</div>
          </div>
        )}

        {variant === 'crazyhouse' && (
          <div className="check-counter" aria-label="Crazyhouse reserves">
            <div>White reserve: {state.crazyhouseReserves.w.join(' ') || '—'}</div>
            <div>Black reserve: {state.crazyhouseReserves.b.join(' ') || '—'}</div>
          </div>
        )}

        <div className="move-history">
          <h3>Moves</h3>
          <ol aria-live="polite">
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
          <button type="button" className="danger" onClick={() => setGameOver('White wins by resignation')}>
            <Flag size={16} /> Resign
          </button>
          <button type="button" className="ghost" onClick={onExit}>← Lobby</button>
        </div>

        {gameOver && <div className="game-over-banner">{gameOver}</div>}
      </div>

      <div className="board-area" aria-label="Chess board">
        <Chessboard
          options={{
            position: fen,
            boardOrientation: orientation,
            onPieceDrop: onDrop,
            squareStyles,
            animationDurationInMs: variantDef.mode === 'neo' ? 180 : 120,
            showNotation: true,
            allowDragging: !gameOver,
            ...boardStyles,
          }}
        />
        {variant === 'neoFog' && (
          <div className="fog-overlay" aria-hidden="true" />
        )}
      </div>

      {showAnalysis && (
        <AnalysisPanel lines={engineLines} fen={fen} onClose={() => setShowAnalysis(false)} />
      )}
    </div>
    </ErrorBoundary>
  );
}
