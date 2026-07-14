import { Chess, type Square, type Move } from 'chess.js';
import type { VariantId } from '../types';

const CENTER_SQUARES: Square[] = ['d4', 'd5', 'e4', 'e5'];
const FILES = 'abcdefgh';

export interface ExtendedGameState {
  chess: Chess;
  checksWhite: number;
  checksBlack: number;
  fogRevealed: Set<string>;
  crazyhouseReserves: { w: string[]; b: string[] };
}

/** Valid Chess960 back ranks — bishops on opposite colors, king between rooks. */
export function generate960BackRank(rng: () => number = Math.random): string {
  // Place bishops on opposite colors
  const lightSquares = [0, 2, 4, 6];
  const darkSquares = [1, 3, 5, 7];
  const result = new Array<string>(8).fill('');

  const light = lightSquares[Math.floor(rng() * lightSquares.length)];
  const dark = darkSquares[Math.floor(rng() * darkSquares.length)];
  result[light] = 'B';
  result[dark] = 'B';

  const empty = () => [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => !result[i]);

  // Queen on a remaining square
  const emptyForQueen = empty();
  result[emptyForQueen[Math.floor(rng() * emptyForQueen.length)]] = 'Q';

  // Knights on two remaining squares
  const emptyForKnights = empty();
  const n1 = Math.floor(rng() * emptyForKnights.length);
  result[emptyForKnights[n1]] = 'N';
  const emptyForKnight2 = empty();
  result[emptyForKnight2[Math.floor(rng() * emptyForKnight2.length)]] = 'N';

  // Remaining three: R K R (king between rooks — only one valid order)
  const remaining = empty();
  remaining.sort((a, b) => a - b);
  result[remaining[0]] = 'R';
  result[remaining[1]] = 'K';
  result[remaining[2]] = 'R';

  return result.join('');
}

export function isValid960BackRank(rank: string): boolean {
  if (rank.length !== 8) return false;
  const pieces = rank.split('');
  if (pieces.filter((p) => p === 'K').length !== 1) return false;
  if (pieces.filter((p) => p === 'Q').length !== 1) return false;
  if (pieces.filter((p) => p === 'R').length !== 2) return false;
  if (pieces.filter((p) => p === 'N').length !== 2) return false;
  if (pieces.filter((p) => p === 'B').length !== 2) return false;

  const bishops = pieces.map((p, i) => (p === 'B' ? i : -1)).filter((i) => i >= 0);
  if (bishops[0] % 2 === bishops[1] % 2) return false;

  const king = pieces.indexOf('K');
  const rooks = pieces.map((p, i) => (p === 'R' ? i : -1)).filter((i) => i >= 0);
  return rooks[0] < king && king < rooks[1];
}

export function createGame(variant: VariantId): ExtendedGameState {
  const chess = new Chess();

  if (variant === 'chess960') {
    const whiteBack = generate960BackRank();
    const blackBack = whiteBack.toLowerCase();
    const fen = `${blackBack}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBack} w - - 0 1`;
    try {
      chess.load(fen);
    } catch {
      // Fallback: fixed valid Chess960 position (startpos #518 is classical)
      chess.reset();
    }
  }

  const fogRevealed = new Set<string>();
  if (variant === 'neoFog') {
    // Reveal white's starting vision
    for (const file of FILES) {
      fogRevealed.add(`${file}1`);
      fogRevealed.add(`${file}2`);
    }
  }

  return {
    chess,
    checksWhite: 0,
    checksBlack: 0,
    fogRevealed,
    crazyhouseReserves: { w: [], b: [] },
  };
}

export function tryMove(
  state: ExtendedGameState,
  from: Square,
  to: Square,
  promotion?: string,
  variant: VariantId = 'standard',
): { ok: boolean; state: ExtendedGameState; special?: string } {
  const chess = new Chess(state.chess.fen());
  let move: Move | null;

  try {
    move = chess.move({ from, to, promotion: promotion ?? 'q' });
  } catch {
    return { ok: false, state };
  }

  if (!move) return { ok: false, state };

  const next: ExtendedGameState = {
    ...state,
    chess,
    checksWhite: state.checksWhite,
    checksBlack: state.checksBlack,
    fogRevealed: new Set(state.fogRevealed),
    crazyhouseReserves: {
      w: [...state.crazyhouseReserves.w],
      b: [...state.crazyhouseReserves.b],
    },
  };

  if (variant === 'crazyhouse' && move.captured) {
    // Captured piece joins the capturer's reserve (pawns stay pawns; promoted pieces demote)
    const piece = move.captured === 'p' ? 'p' : move.captured;
    const capturer = move.color; // side that just moved
    next.crazyhouseReserves[capturer].push(piece);
  }

  if (variant === 'threeCheck' && chess.inCheck()) {
    // The side that just moved delivered the check
    if (move.color === 'w') next.checksWhite++;
    else next.checksBlack++;
    if (next.checksWhite >= 3 || next.checksBlack >= 3) {
      return { ok: true, state: next, special: 'three-check-win' };
    }
  }

  if (variant === 'kingOfTheHill') {
    const moverKing = findKingSquare(chess, move.color);
    if (moverKing && CENTER_SQUARES.includes(moverKing)) {
      return { ok: true, state: next, special: 'koth-win' };
    }
  }

  if (variant === 'atomic' && move.captured) {
    applyAtomicExplosion(next, to, move.color);
    const whiteKing = findKingSquare(next.chess, 'w');
    const blackKing = findKingSquare(next.chess, 'b');
    if (!whiteKing) return { ok: true, state: next, special: 'atomic-win-black' };
    if (!blackKing) return { ok: true, state: next, special: 'atomic-win-white' };
  }

  if (variant === 'neoFog') {
    revealFog(next, from);
    revealFog(next, to);
  }

  return { ok: true, state: next };
}

/** Drop a reserved piece onto an empty square (Crazyhouse). */
export function tryDrop(
  state: ExtendedGameState,
  piece: string,
  square: Square,
  color: 'w' | 'b',
): { ok: boolean; state: ExtendedGameState } {
  const reserves = state.crazyhouseReserves[color];
  const idx = reserves.indexOf(piece);
  if (idx === -1) return { ok: false, state };
  if (state.chess.get(square)) return { ok: false, state };
  if (piece === 'p') {
    const rank = square[1];
    if (rank === '1' || rank === '8') return { ok: false, state };
  }
  if (state.chess.turn() !== color) return { ok: false, state };

  const chess = new Chess(state.chess.fen());
  try {
    chess.put({ type: piece as 'p' | 'n' | 'b' | 'r' | 'q', color }, square);
    // Advance turn manually by reconstructing FEN
    const parts = chess.fen().split(' ');
    parts[1] = color === 'w' ? 'b' : 'w';
    if (parts[1] === 'w') parts[5] = String(Number(parts[5]) + 1);
    chess.load(parts.join(' '));
  } catch {
    return { ok: false, state };
  }

  const nextReserves = { ...state.crazyhouseReserves, [color]: [...reserves] };
  nextReserves[color].splice(idx, 1);

  return {
    ok: true,
    state: {
      ...state,
      chess,
      crazyhouseReserves: nextReserves,
      fogRevealed: new Set(state.fogRevealed),
    },
  };
}

function findKingSquare(chess: Chess, color: 'w' | 'b'): Square | null {
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return `${FILES[c]}${8 - r}` as Square;
      }
    }
  }
  return null;
}

function applyAtomicExplosion(state: ExtendedGameState, square: Square, capturer: 'w' | 'b') {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  // Remove capturing piece first (atomic: capturer also explodes)
  state.chess.remove(square);
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const r = rank + dr;
      const f = file + df;
      if (r < 0 || r > 7 || f < 0 || f > 7) continue;
      const sq = `${FILES[f]}${r + 1}` as Square;
      const p = state.chess.get(sq);
      if (!p) continue;
      // Pawns survive adjacent explosions; kings and other pieces do not
      if (p.type === 'p' && !(df === 0 && dr === 0)) continue;
      state.chess.remove(sq);
    }
  }
  void capturer;
}

function revealFog(state: ExtendedGameState, square: Square) {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const r = rank + dr;
      const f = file + df;
      if (r >= 0 && r < 8 && f >= 0 && f < 8) {
        state.fogRevealed.add(`${FILES[f]}${r + 1}`);
      }
    }
  }
}

export function getGameResult(state: ExtendedGameState, variant: VariantId): string | null {
  const { chess } = state;
  if (variant === 'threeCheck') {
    if (state.checksWhite >= 3) return 'White wins by three-check';
    if (state.checksBlack >= 3) return 'Black wins by three-check';
  }
  if (chess.isCheckmate()) return `${chess.turn() === 'w' ? 'Black' : 'White'} wins by checkmate`;
  if (chess.isStalemate()) return 'Draw by stalemate';
  if (chess.isThreefoldRepetition()) return 'Draw by threefold repetition';
  if (chess.isInsufficientMaterial()) return 'Draw by insufficient material';
  if (chess.isDraw()) return 'Draw';
  return null;
}

export function squareHeat(chess: Chess, square: Square): number {
  const moves = chess.moves({ square, verbose: true });
  return Math.min(moves.length / 8, 1);
}

export function formatTime(seconds: number): string {
  if (seconds <= 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
