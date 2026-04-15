import { Player } from './Player';

export interface RoundResult {
  player: Player;
  tricks: number;
  bid: number;
  score: number;
}

export class Round {
  private roundNumber: number;
  private results: RoundResult[] = [];

  constructor(roundNumber: number) {
    if (roundNumber < 1 || roundNumber > 10) {
      throw new Error('Round number must be between 1 and 10');
    }
    this.roundNumber = roundNumber;
  }

  public getRoundNumber(): number {
    return this.roundNumber;
  }

  public addResult(result: RoundResult): void {
    this.results.push(result);
  }

  public getResults(): RoundResult[] {
    return [...this.results];
  }

  public isComplete(): boolean {
    return this.results.length > 0;
  }
}
