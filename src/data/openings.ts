export interface OpeningEntry {
  eco: string;
  name: string;
  moves: string;
  fen: string;
  popularity: number;
  style: 'classical' | 'aggressive' | 'positional' | 'uncommon';
}

/** Compact ECO sample — seed for Opening Lab + Explore tab */
export const OPENINGS: OpeningEntry[] = [
  {
    eco: 'B20',
    name: 'Sicilian Defense',
    moves: '1.e4 c5',
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    popularity: 96,
    style: 'aggressive',
  },
  {
    eco: 'C50',
    name: 'Italian Game',
    moves: '1.e4 e5 2.Nf3 Nc6 3.Bc4',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    popularity: 88,
    style: 'classical',
  },
  {
    eco: 'C60',
    name: 'Ruy Lopez',
    moves: '1.e4 e5 2.Nf3 Nc6 3.Bb5',
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    popularity: 91,
    style: 'positional',
  },
  {
    eco: 'D00',
    name: "Queen's Pawn Game",
    moves: '1.d4 d5',
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq d6 0 2',
    popularity: 84,
    style: 'positional',
  },
  {
    eco: 'E00',
    name: 'Catalan Opening',
    moves: '1.d4 Nf6 2.c4 e6 3.g3',
    fen: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3',
    popularity: 72,
    style: 'positional',
  },
  {
    eco: 'A40',
    name: "King's Indian Defense setup",
    moves: '1.d4 Nf6 2.c4 g6',
    fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    popularity: 80,
    style: 'aggressive',
  },
  {
    eco: 'A00',
    name: 'Grob Attack (uncommon)',
    moves: '1.g4',
    fen: 'rnbqkbnr/pppppppp/8/8/6P1/8/PPPPPP1P/RNBQKBNR b KQkq g3 0 1',
    popularity: 12,
    style: 'uncommon',
  },
  {
    eco: 'B06',
    name: 'Modern Defense',
    moves: '1.e4 g6',
    fen: 'rnbqkbnr/pppppp1p/6p1/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    popularity: 55,
    style: 'uncommon',
  },
  {
    eco: 'C20',
    name: "King's Pawn Game",
    moves: '1.e4 e5',
    fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2',
    popularity: 94,
    style: 'classical',
  },
  {
    eco: 'A45',
    name: 'Trompowsky Attack',
    moves: '1.d4 Nf6 2.Bg5',
    fen: 'rnbqkb1r/pppppppp/5n2/6B1/3P4/8/PPP1PPPP/RN1QKBNR b KQkq - 2 2',
    popularity: 48,
    style: 'aggressive',
  },
];
