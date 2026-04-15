import { GamePhase, GameRound, GameState, GameStatus } from '../types/game';
import { Player } from '../types/player';

const TOTAL_ROUNDS = 10;
const MAX_PLAYERS = 6;
const MIN_PLAYERS = 2;

export class GameFlowManager {
  private gameState: GameState;
  private currentRound: GameRound;
  private currentPhase: GamePhase;
  private roundNumber: number;
  private gameStatus: GameStatus;

  constructor(players: Player[]) {
    if (players.length < MIN_PLAYERS || players.length > MAX_PLAYERS) {
      throw new Error(`Game requires between ${MIN_PLAYERS} and ${MAX_PLAYERS} players`);
    }

    this.roundNumber = 1;
    this.currentPhase = 'setup';
    this.gameStatus = 'in_progress';
    this.gameState = {
      players,
      roundNumber: this.roundNumber,
      currentPhase: this.currentPhase,
      status: this.gameStatus,
      rounds: [],
      winner: null,
      finalScores: null
    };
    this.currentRound = this.initializeRound();
  }

  private initializeRound(): GameRound {
    return {
      roundNumber: this.roundNumber,
      status: 'not_started',
      setup: { completed: false, skullsDealt: false },
      bidding: { completed: false, bids: {} },
      scoring: { completed: false, tricks: {}, scores: {} }
    };
  }

  /**
   * Progresses to the next phase in the game flow
   * setup → bidding → scoring → next round (or game end)
   */
  public advancePhase(): boolean {
    switch (this.currentPhase) {
      case 'setup':
        return this.transitionToPhase('bidding');
      case 'bidding':
        return this.transitionToPhase('scoring');
      case 'scoring':
        return this.advanceRound();
      default:
        return false;
    }
  }

  private transitionToPhase(newPhase: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      'setup': ['bidding'],
      'bidding': ['scoring'],
      'scoring': ['setup', 'complete']
    };

    if (validTransitions[this.currentPhase]?.includes(newPhase)) {
      this.currentPhase = newPhase;
      this.gameState.currentPhase = newPhase;
      return true;
    }
    return false;
  }

  /**
   * Advances to the next round after scoring is complete
   * Returns false if game is complete
   */
  private advanceRound(): boolean {
    // Mark current round as complete
    this.currentRound.status = 'completed';
    this.gameState.rounds.push(this.currentRound);

    // Check if all 10 rounds are complete
    if (this.roundNumber >= TOTAL_ROUNDS) {
      return this.completeGame();
    }

    // Initialize next round
    this.roundNumber++;
    this.gameState.roundNumber = this.roundNumber;
    this.currentRound = this.initializeRound();
    this.currentPhase = 'setup';
    this.gameState.currentPhase = 'setup';
    return true;
  }

  /**
   * Completes the game after round 10
   * Determines winner and final scores
   */
  private completeGame(): boolean {
    this.gameStatus = 'completed';
    this.gameState.status = 'completed';
    this.currentPhase = 'complete';
    this.gameState.currentPhase = 'complete';

    const winner = this.calculateWinner();
    const finalScores = this.calculateFinalScores();

    this.gameState.winner = winner;
    this.gameState.finalScores = finalScores;

    return false; // Game is complete
  }

  /**
   * Calculates the winner based on final scores
   */
  private calculateWinner(): Player | null {
    if (this.gameState.rounds.length === 0) {
      return null;
    }

    const scoreMap: Record<string, number> = {};

    // Sum scores across all rounds
    this.gameState.rounds.forEach(round => {
      if (round.scoring.scores) {
        Object.entries(round.scoring.scores).forEach(([playerId, score]) => {
          scoreMap[playerId] = (scoreMap[playerId] || 0) + score;
        });
      }
    });

    // Find player with highest score
    let winner: Player | null = null;
    let maxScore = -Infinity;

    for (const player of this.gameState.players) {
      const playerScore = scoreMap[player.id] || 0;
      if (playerScore > maxScore) {
        maxScore = playerScore;
        winner = player;
      }
    }

    return winner;
  }

  /**
   * Calculates final scores for all players
   */
  private calculateFinalScores(): Record<string, number> {
    const scores: Record<string, number> = {};

    // Initialize all players
    this.gameState.players.forEach(player => {
      scores[player.id] = 0;
    });

    // Sum scores from all rounds
    this.gameState.rounds.forEach(round => {
      if (round.scoring.scores) {
        Object.entries(round.scoring.scores).forEach(([playerId, score]) => {
          scores[playerId] = (scores[playerId] || 0) + score;
        });
      }
    });

    return scores;
  }

  /**
   * Records setup phase completion
   */
  public completeSetup(skullsDealt: boolean): void {
    if (this.currentPhase !== 'setup') {
      throw new Error('Cannot complete setup outside setup phase');
    }
    this.currentRound.setup = {
      completed: true,
      skullsDealt
    };
  }

  /**
   * Records bidding phase completion with player bids
   */
  public completeBidding(bids: Record<string, number>): void {
    if (this.currentPhase !== 'bidding') {
      throw new Error('Cannot complete bidding outside bidding phase');
    }
    this.currentRound.bidding = {
      completed: true,
      bids
    };
  }

  /**
   * Records scoring phase completion with tricks and scores
   */
  public completeScoring(tricks: Record<string, number>, scores: Record<string, number>): void {
    if (this.currentPhase !== 'scoring') {
      throw new Error('Cannot complete scoring outside scoring phase');
    }
    this.currentRound.scoring = {
      completed: true,
      tricks,
      scores
    };
  }

  /**
   * Gets current game state
   */
  public getGameState(): GameState {
    return { ...this.gameState };
  }

  /**
   * Gets current phase
   */
  public getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * Gets current round number
   */
  public getCurrentRound(): number {
    return this.roundNumber;
  }

  /**
   * Gets game status
   */
  public getGameStatus(): GameStatus {
    return this.gameStatus;
  }

  /**
   * Gets current round data
   */
  public getCurrentRoundData(): GameRound {
    return { ...this.currentRound };
  }

  /**
   * Checks if game is complete
   */
  public isGameComplete(): boolean {
    return this.gameStatus === 'completed';
  }

  /**
   * Gets final winner (only available after game completion)
   */
  public getWinner(): Player | null {
    return this.gameState.winner;
  }

  /**
   * Gets final scores (only available after game completion)
   */
  public getFinalScores(): Record<string, number> | null {
    return this.gameState.finalScores;
  }

  /**
   * Gets game completion summary
   */
  public getGameSummary(): { winner: Player | null; finalScores: Record<string, number> | null; totalRounds: number } {
    return {
      winner: this.gameState.winner,
      finalScores: this.gameState.finalScores,
      totalRounds: this.gameState.rounds.length
    };
  }
}
