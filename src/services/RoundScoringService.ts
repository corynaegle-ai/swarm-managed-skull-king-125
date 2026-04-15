import { Player } from '../types/Player';
import { ScoreEngine } from '../scoring/ScoreEngine';

export interface RoundScoringInput {
  tricksPerPlayer: number[];
  bonusPerPlayer: number[];
  playerBids: number[];
}

export interface RoundScoringResult {
  roundScores: number[];
  totalScores: number[];
}

export class RoundScoringService {
  constructor(private scoreEngine: ScoreEngine) {}

  /**
   * Processes the round scoring input and updates player totals
   * @param players The list of players to update
   * @param input The round scoring data
   * @returns The round scores and updated totals
   */
  processRoundScoring(
    players: Player[],
    input: RoundScoringInput
  ): RoundScoringResult {
    // Validate input
    this.validateInput(players.length, input);

    // Calculate round scores using the score engine
    const roundScores = this.calculateRoundScores(
      input.playerBids,
      input.tricksPerPlayer,
      input.bonusPerPlayer
    );

    // Update player totals
    const totalScores = players.map((player, index) => {
      return (player.totalScore || 0) + roundScores[index];
    });

    return {
      roundScores,
      totalScores,
    };
  }

  /**
   * Calculates the score for each player in the round
   * @param bids The bid for each player
   * @param tricks The tricks taken by each player
   * @param bonusPoints The bonus points for each player
   * @returns The round score for each player
   */
  private calculateRoundScores(
    bids: number[],
    tricks: number[],
    bonusPoints: number[]
  ): number[] {
    return bids.map((bid, index) => {
      return this.scoreEngine.scoreRound(
        bid,
        tricks[index],
        bonusPoints[index]
      );
    });
  }

  /**
   * Validates the input for round scoring
   * @throws Error if validation fails
   */
  private validateInput(
    playerCount: number,
    input: RoundScoringInput
  ): void {
    const { tricksPerPlayer, bonusPerPlayer, playerBids } = input;

    // Check array lengths
    if (
      tricksPerPlayer.length !== playerCount ||
      bonusPerPlayer.length !== playerCount ||
      playerBids.length !== playerCount
    ) {
      throw new Error('Invalid input: array lengths do not match player count');
    }

    // Check that all values are valid numbers
    tricksPerPlayer.forEach((tricks, index) => {
      if (typeof tricks !== 'number' || tricks < 0) {
        throw new Error(`Invalid tricks value for player ${index}`);
      }
    });

    bonusPerPlayer.forEach((bonus, index) => {
      if (typeof bonus !== 'number' || bonus < 0) {
        throw new Error(`Invalid bonus value for player ${index}`);
      }
    });

    // Check that bonus points are only given when bid was correct
    bonusPerPlayer.forEach((bonus, index) => {
      if (bonus > 0 && tricksPerPlayer[index] !== playerBids[index]) {
        throw new Error(
          `Bonus points cannot be given to player ${index} when bid was incorrect`
        );
      }
    });
  }
}
