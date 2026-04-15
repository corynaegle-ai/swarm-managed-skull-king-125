export interface ScoreEngine {
  /**
   * Calculates the score for a single player's round
   * @param bid The player's bid for the round
   * @param tricks The actual tricks taken by the player
   * @param bonus Bonus points earned (only if bid was correct)
   * @returns The score for this round
   */
  scoreRound(bid: number, tricks: number, bonus: number): number;
}

/**
 * Implementation of the Skull King scoring rules
 */
export class SkullKingScoreEngine implements ScoreEngine {
  /**
   * Scores a round according to Skull King rules:
   * - If bid == tricks: 10 points + bonus points
   * - If bid != tricks: -5 points
   * @param bid The player's bid for the round
   * @param tricks The actual tricks taken by the player
   * @param bonus Bonus points earned (only valid if bid was correct)
   * @returns The score for this round
   */
  scoreRound(bid: number, tricks: number, bonus: number): number {
    if (bid === tricks) {
      return 10 + bonus;
    } else {
      return -5;
    }
  }
}
