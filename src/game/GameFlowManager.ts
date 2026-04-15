import { Player } from './Player';
import { Round } from './Round';

export enum GamePhase {
  SETUP = 'SETUP',
  BIDDING = 'BIDDING',
  SCORING = 'SCORING',
  COMPLETE = 'COMPLETE'
}

export class GameFlowManager {
  private currentPhase: GamePhase = GamePhase.SETUP;
  private currentRound: number = 1;
  private maxRounds: number = 10;
  private players: Player[];
  private rounds: Round[] = [];
  private gameWinner: Player | null = null;

  constructor(players: Player[]) {
    if (!players || players.length === 0) {
      throw new Error('At least one player is required');
    }
    this.players = players;
  }

  /**
   * Get the current game phase
   */
  public getCurrentPhase(): GamePhase {
    return this.currentPhase;
  }

  /**
   * Get the current round number
   */
  public getCurrentRound(): number {
    return this.currentRound;
  }

  /**
   * Get the maximum number of rounds
   */
  public getMaxRounds(): number {
    return this.maxRounds;
  }

  /**
   * Get all players
   */
  public getPlayers(): Player[] {
    return this.players;
  }

  /**
   * Get all completed rounds
   */
  public getRounds(): Round[] {
    return this.rounds;
  }

  /**
   * Initialize game setup phase
   */
  public initializeSetup(): void {
    if (this.currentPhase !== GamePhase.SETUP) {
      throw new Error('Game setup can only be initialized in SETUP phase');
    }
    // Initialize player scores
    this.players.forEach(player => {
      player.resetScore();
    });
  }

  /**
   * Complete setup and transition to bidding phase
   */
  public completeSetup(): void {
    if (this.currentPhase !== GamePhase.SETUP) {
      throw new Error('Setup can only be completed in SETUP phase');
    }
    this.currentPhase = GamePhase.BIDDING;
  }

  /**
   * Complete bidding phase and transition to scoring
   */
  public completeBidding(): void {
    if (this.currentPhase !== GamePhase.BIDDING) {
      throw new Error('Bidding can only be completed in BIDDING phase');
    }
    this.currentPhase = GamePhase.SCORING;
  }

  /**
   * Complete scoring phase and transition to next round or game completion
   */
  public completeScoring(roundData: Round): void {
    if (this.currentPhase !== GamePhase.SCORING) {
      throw new Error('Scoring can only be completed in SCORING phase');
    }

    // Store the completed round
    this.rounds.push(roundData);

    // Check if we've completed 10 rounds
    if (this.currentRound >= this.maxRounds) {
      this.completeGame();
    } else {
      // Advance to next round
      this.currentRound++;
      this.currentPhase = GamePhase.BIDDING;
    }
  }

  /**
   * Determine game winner and mark game as complete
   */
  private completeGame(): void {
    this.currentPhase = GamePhase.COMPLETE;

    // Calculate final scores and determine winner
    const playerScores = this.players.map(player => ({
      player,
      score: player.getTotalScore()
    }));

    // Sort by score (highest first)
    playerScores.sort((a, b) => b.score - a.score);

    if (playerScores.length > 0) {
      this.gameWinner = playerScores[0].player;
    }
  }

  /**
   * Check if game is complete
   */
  public isGameComplete(): boolean {
    return this.currentPhase === GamePhase.COMPLETE;
  }

  /**
   * Get the game winner (only available after game completion)
   */
  public getGameWinner(): Player | null {
    if (!this.isGameComplete()) {
      throw new Error('Game is not complete yet');
    }
    return this.gameWinner;
  }

  /**
   * Get final scores for all players
   */
  public getFinalScores(): { player: Player; score: number }[] {
    if (!this.isGameComplete()) {
      throw new Error('Game is not complete yet');
    }

    return this.players
      .map(player => ({
        player,
        score: player.getTotalScore()
      }))
      .sort((a, b) => b.score - a.score);
  }

  /**
   * Get game summary
   */
  public getGameSummary(): {
    winner: Player | null;
    finalScores: { player: Player; score: number }[];
    totalRoundsPlayed: number;
  } {
    if (!this.isGameComplete()) {
      throw new Error('Game is not complete yet');
    }

    return {
      winner: this.gameWinner,
      finalScores: this.getFinalScores(),
      totalRoundsPlayed: this.currentRound
    };
  }
}
