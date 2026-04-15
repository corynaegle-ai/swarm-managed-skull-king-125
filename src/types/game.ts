import { Player } from './player';

export type GamePhase = 'setup' | 'bidding' | 'scoring' | 'complete';
export type GameStatus = 'in_progress' | 'completed' | 'paused';

export interface GameSetup {
  completed: boolean;
  skullsDealt: boolean;
}

export interface GameBidding {
  completed: boolean;
  bids: Record<string, number>;
}

export interface GameScoring {
  completed: boolean;
  tricks: Record<string, number>;
  scores: Record<string, number>;
}

export interface GameRound {
  roundNumber: number;
  status: 'not_started' | 'in_progress' | 'completed';
  setup: GameSetup;
  bidding: GameBidding;
  scoring: GameScoring;
}

export interface GameState {
  players: Player[];
  roundNumber: number;
  currentPhase: GamePhase;
  status: GameStatus;
  rounds: GameRound[];
  winner: Player | null;
  finalScores: Record<string, number> | null;
}
