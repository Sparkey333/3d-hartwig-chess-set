import { Chess, type Square, type Move } from 'chess.js';
import type { VariantId } from '../types';

const CENTER_SQUARES: Square[] = ['d4', 'd5', 'e4', 'e5'];
const ALL_SQUARES = Array.from({ length: 8 }, (_, r) =>
  Array.from({ length: 8 }, (_, c) => `${'abcdefgh'[c]}${8 - r}` as Square),
).flat();

export interface ExtendedGameState {
  chess: Chess;
  checksWhite: number;
  checksBlack: number;
  fogRevealed: Set<string>;
  crazyhouseReserves: { w: string[]; b: string[] };
}

export function createGame(
  variant: VariantId,
  options?: { removeSquare?: Square | null },
): ExtendedGameState {
  const chess = new Chess();

  if (variant === 'chess960') {
    const whiteBack = generate960BackRank();
    const blackBack = whiteBack.toLowerCase();
    const fen = `${blackBack}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBack} w KQkq - 0 1`;
    try {
      chess.load(fen);
    } catch {
      chess.reset();
    }
  }

  if (options?.removeSquare) {
    chess.remove(options.removeSquare);
  }

  const fog = new Set<string>();
  if (variant === 'neoFog') {
    for (const sq of computeFogVision(chess, 'w')) fog.add(sq);
  }

  return {
    chess,
    checksWhite: 0,
    checksBlack: 0,
    fogRevealed: fog,
    crazyhouseReserves: { w: [], b: [] },
  };
}

function generate960BackRank(): string {
  return enforce960Rules(['R', 'N', 'B', 'B', 'Q', 'K', 'N', 'R']);
}

function enforce960Rules(pieces: string[]): string {
  const result = new Array<string>(8).fill('');
  const bishopSlotsLight = [0, 2, 4, 6];
  const bishopSlotsDark = [1, 3, 5, 7];
  result[bishopSlotsLight[Math.floor(Math.random() * 4)]] = 'B';
  result[bishopSlotsDark[Math.floor(Math.random() * 4)]] = 'B';

  const empty = () => [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => !result[i]);
  let slots = empty();
  const kingPos = slots[Math.floor(Math.random() * (slots.length - 2)) + 1] ?? slots[1];
  result[kingPos] = 'K';
  slots = empty();
  const left = slots.filter((i) => i < kingPos);
  const right = slots.filter((i) => i > kingPos);
  result[left[Math.floor(Math.random() * left.length)]] = 'R';
  result[right[Math.floor(Math.random() * right.length)]] = 'R';

  const rest = pieces.filter((p) => !['B', 'K', 'R'].includes(p));
  let ri = 0;
  for (let i = 0; i < 8; i++) {
    if (!result[i]) result[i] = rest[ri++];
  }
  return result.join('');
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
    const side = move.color;
    const piece = move.captured === 'p' ? 'p' : move.captured;
    next.crazyhouseReserves[side].push(piece);
  }

  if (variant === 'threeCheck' && chess.inCheck()) {
    if (chess.turn() === 'w') next.checksBlack++;
    else next.checksWhite++;
    if (next.checksWhite >= 3 || next.checksBlack >= 3) {
      return { ok: true, state: next, special: 'three-check-win' };
    }
  }

  if (variant === 'kingOfTheHill') {
    const kingSquare = findKingSquare(chess, chess.turn() === 'w' ? 'b' : 'w');
    if (kingSquare && CENTER_SQUARES.includes(kingSquare)) {
      return { ok: true, state: next, special: 'koth-win' };
    }
  }

  if (variant === 'atomic' && move.captured) {
    applyAtomicExplosion(next, to);
  }

  if (variant === 'neoFog') {
    next.fogRevealed = computeFogVision(chess, 'w');
  }

  return { ok: true, state: next };
}

export function tryCrazyhouseDrop(
  state: ExtendedGameState,
  piece: string,
  square: Square,
  color: 'w' | 'b',
): { ok: boolean; state: ExtendedGameState } {
  if (piece === 'p') {
    const rank = square[1];
    if (rank === '1' || rank === '8') return { ok: false, state };
  }
  if (state.chess.get(square)) return { ok: false, state };

  const reserve = [...state.crazyhouseReserves[color]];
  const idx = reserve.indexOf(piece);
  if (idx < 0) return { ok: false, state };
  reserve.splice(idx, 1);

  const chess = new Chess(state.chess.fen());
  const placed = chess.put(
    { type: piece as 'p' | 'n' | 'b' | 'r' | 'q' | 'k', color },
    square,
  );
  if (!placed) return { ok: false, state };

  // Switch turn manually by loading FEN with flipped side
  const parts = chess.fen().split(' ');
  parts[1] = color === 'w' ? 'b' : 'w';
  try {
    chess.load(parts.join(' '));
  } catch {
    return { ok: false, state };
  }

  return {
    ok: true,
    state: {
      ...state,
      chess,
      crazyhouseReserves: {
        ...state.crazyhouseReserves,
        [color]: reserve,
      },
      fogRevealed: new Set(state.fogRevealed),
    },
  };
}

export function computeFogVision(chess: Chess, color: 'w' | 'b'): Set<string> {
  const visible = new Set<string>();
  for (const sq of ALL_SQUARES) {
    const piece = chess.get(sq);
    if (piece && piece.color === color) {
      visible.add(sq);
      for (const m of chess.moves({ square: sq, verbose: true })) {
        visible.add(m.to);
      }
      // king adjacent fog
      if (piece.type === 'k') {
        const file = sq.charCodeAt(0) - 97;
        const rank = parseInt(sq[1], 10) - 1;
        for (let dr = -1; dr <= 1; dr++) {
          for (let df = -1; df <= 1; df++) {
            const f = file + df;
            const r = rank + dr;
            if (f >= 0 && f < 8 && r >= 0 && r < 8) {
              visible.add(`${'abcdefgh'[f]}${r + 1}`);
            }
          }
        }
      }
    }
  }
  return visible;
}

/** FEN with opponent pieces outside vision removed for Fog of War display */
export function fogDisplayFen(state: ExtendedGameState, viewer: 'w' | 'b' = 'w'): string {
  const vision = computeFogVision(state.chess, viewer);
  const clone = new Chess(state.chess.fen());
  for (const sq of ALL_SQUARES) {
    const piece = clone.get(sq);
    if (piece && piece.color !== viewer && !vision.has(sq) && !state.fogRevealed.has(sq)) {
      clone.remove(sq);
    }
  }
  return clone.fen();
}

function findKingSquare(chess: Chess, color: 'w' | 'b'): Square | null {
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'k' && p.color === color) {
        return `${'abcdefgh'[c]}${8 - r}` as Square;
      }
    }
  }
  return null;
}

function applyAtomicExplosion(state: ExtendedGameState, square: Square) {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const r = rank + dr;
      const f = file + df;
      if (r >= 0 && r < 8 && f >= 0 && f < 8) {
        const sq = `${'abcdefgh'[f]}${r + 1}` as Square;
        const p = state.chess.get(sq);
        if (p && p.type !== 'p' && p.type !== 'k') {
          state.chess.remove(sq);
        }
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
