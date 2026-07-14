export type GameMode = 'traditional' | 'competition' | 'neo';

export type VariantId =
  | 'standard'
  | 'chess960'
  | 'threeCheck'
  | 'kingOfTheHill'
  | 'atomic'
  | 'crazyhouse'
  | 'neoPulse'
  | 'neoFog'
  | 'neoGravity';

export interface VariantDefinition {
  id: VariantId;
  name: string;
  tagline: string;
  mode: GameMode;
  description: string;
  rules: string[];
  premium?: boolean;
  popular?: boolean;
}

export interface TimeControl {
  id: string;
  label: string;
  initial: number;
  increment: number;
}

export interface ClubVenue {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  schedule: string;
  level: 'beginner' | 'club' | 'rated' | 'master';
  uscfRated: boolean;
  website?: string;
  description: string;
  distanceMiles?: number;
}

export interface TournamentEvent {
  id: string;
  name: string;
  city: string;
  state: string;
  date: string;
  endDate?: string;
  format: string;
  entryFee: string;
  level: 'local' | 'state' | 'national' | 'master';
  organizer: string;
  url?: string;
  uscfRated: boolean;
}

export interface PremiumFeature {
  id: string;
  title: string;
  description: string;
  provider: 'higgsfield' | 'stockfish' | 'neo';
  tier: 'pro' | 'elite';
  available: boolean;
}

export interface EngineLine {
  depth: number;
  score: number;
  pv: string;
  mate?: number;
}

export interface GameSettings {
  variant: VariantId;
  timeControl: TimeControl;
  playerColor: 'white' | 'black' | 'random';
  engineLevel: number;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  soundEnabled: boolean;
}
