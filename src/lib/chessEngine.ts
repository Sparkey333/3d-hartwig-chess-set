import { Chess, type Square, type Move } from 'chess.js';
import type { VariantId } from '../types';

const CENTER_SQUARES: Square[] = ['d4', 'd5', 'e4', 'e5'];

export interface ExtendedGameState {
  chess: Chess;
  checksWhite: number;
  checksBlack: number;
  fogRevealed: Set<string>;
  crazyhouseReserves: { w: string[]; b: string[] };
}

export function createGame(variant: VariantId): ExtendedGameState {
  const chess = new Chess();

  if (variant === 'chess960') {
    const backRank = shuffleBackRank();
    chess.load(`rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/${backRank} w KQkq - 0 1`.replace(
      'rnbqkbnr',
      backRank.split('').reverse().join('').replace(/[a-h]/g, (c) => c.toUpperCase()),
    ));
    // Simpler approach: randomize via FEN manipulation
    const whiteBack = generate960BackRank();
    const blackBack = whiteBack.toLowerCase();
    const fen = `${blackBack}/pppppppp/8/8/8/8/PPPPPPPP/${whiteBack} w KQkq - 0 1`;
    try {
      chess.load(fen);
    } catch {
      chess.reset();
    }
  }

  return {
    chess,
    checksWhite: 0,
    checksBlack: 0,
    fogRevealed: new Set<string>(),
    crazyhouseReserves: { w: [], b: [] },
  };
}

function generate960BackRank(): string {
  const pieces = ['R', 'N', 'B', 'B', 'Q', 'K', 'N', 'R'];
  let backRank: string[];
  do {
    backRank = [...pieces].sort(() => Math.random() - 0.5);
  } while (
    !isValid960Rank(backRank) ||
    backRank.indexOf('B') % 2 === backRank.lastIndexOf('B') % 2
  );
  // Ensure bishops on opposite colors and king between rooks
  return enforce960Rules(pieces);
}

function enforce960Rules(pieces: string[]): string {
  const result = new Array<string>(8).fill('');
  const bishops = pieces.filter((p) => p === 'B');
  result[Math.floor(Math.random() * 4) * 2 + (Math.random() > 0.5 ? 0 : 1)] = bishops[0];
  const remaining = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => !result[i]);
  const darkSquare = remaining.find((i) => i % 2 === 1) ?? remaining[0];
  result[darkSquare] = bishops[1];

  const empty = [0, 1, 2, 3, 4, 5, 6, 7].filter((i) => !result[i]);
  const kingPos = empty[Math.floor(Math.random() * (empty.length - 2)) + 1] ?? empty[1];
  result[kingPos] = 'K';
  const leftRook = empty.filter((i) => i < kingPos)[0];
  const rightRook = empty.filter((i) => i > kingPos).pop();
  if (leftRook !== undefined) result[leftRook] = 'R';
  if (rightRook !== undefined) result[rightRook] = 'R';

  const rest = pieces.filter((p) => !['B', 'K', 'R'].includes(p));
  let ri = 0;
  for (let i = 0; i < 8; i++) {
    if (!result[i]) result[i] = rest[ri++];
  }
  return result.join('');
}

function isValid960Rank(rank: string[]): boolean {
  const king = rank.indexOf('K');
  const rooks = rank.map((p, i) => (p === 'R' ? i : -1)).filter((i) => i >= 0);
  return rooks.some((r) => r < king) && rooks.some((r) => r > king);
}

function shuffleBackRank(): string {
  return enforce960Rules(['R', 'N', 'B', 'B', 'Q', 'K', 'N', 'R']);
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
    crazyhouseReserves: { ...state.crazyhouseReserves, w: [...state.crazyhouseReserves.w], b: [...state.crazyhouseReserves.b] },
  };

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
    revealFog(next, from);
    revealFog(next, to);
  }

  return { ok: true, state: next };
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
  const rank = parseInt(square[1]) - 1;
  const board = state.chess.board();
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const r = rank + dr;
      const f = file + df;
      if (r >= 0 && r < 8 && f >= 0 && f < 8) {
        const p = board[7 - r][f];
        if (p && p.type !== 'p' && p.type !== 'k') {
          state.chess.remove(`${'abcdefgh'[f]}${r + 1}` as Square);
        }
      }
    }
  }
}

function revealFog(state: ExtendedGameState, square: Square) {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;
  for (let dr = -1; dr <= 1; dr++) {
    for (let df = -1; df <= 1; df++) {
      const r = rank + dr;
      const f = file + df;
      if (r >= 0 && r < 8 && f >= 0 && f < 8) {
        state.fogRevealed.add(`${'abcdefgh'[f]}${r + 1}`);
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
