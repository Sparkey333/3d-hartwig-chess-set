export interface Puzzle {
  id: string;
  rating: number;
  themes: string[];
  fen: string;
  /** opponent's last move description */
  setup: string;
  solution: string[]; // UCI moves
  hint: string;
}

export const PUZZLES: Puzzle[] = [
  {
    id: 'mate-in-1-backrank',
    rating: 900,
    themes: ['mateIn1', 'backRankMate'],
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    setup: 'White to move — find mate in 1',
    solution: ['e1e8'],
    hint: 'The back rank is undefended.',
  },
  {
    id: 'fork-knight',
    rating: 1100,
    themes: ['fork', 'knight'],
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    setup: 'White to move — classic Scholar-style tactic',
    solution: ['h5f7'],
    hint: 'Target f7 with the queen.',
  },
  {
    id: 'pin-skewer',
    rating: 1300,
    themes: ['pin', 'skewer'],
    fen: '4r1k1/ppp2ppp/8/8/8/2B5/PPP2PPP/6K1 w - - 0 1',
    setup: 'White to move — exploit the absolute pin',
    solution: ['c3e5'],
    hint: 'Align bishop vs king and unprotected rook ideas.',
  },
  {
    id: 'discovery',
    rating: 1450,
    themes: ['discoveredAttack'],
    fen: 'rnbqk2r/pppp1ppp/5n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
    setup: 'White to move — classic Italian discovered idea preparations',
    solution: ['c4f7'],
    hint: 'Hit the king with the bishop.',
  },
  {
    id: 'endgame-opposition',
    rating: 1250,
    themes: ['endgame', 'kingAndPawn'],
    fen: '8/8/4k3/8/4P3/4K3/8/8 w - - 0 1',
    setup: 'White to move — king and pawn technique',
    solution: ['e3d4', 'e3f4'],
    hint: 'Gain opposition or escort the pawn.',
  },
];
