export class Player {
  private id: string;
  private name: string;
  private totalScore: number = 0;
  private roundScores: number[] = [];

  constructor(id: string, name: string) {
    if (!id || !name) {
      throw new Error('Player id and name are required');
    }
    this.id = id;
    this.name = name;
  }

  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public getTotalScore(): number {
    return this.totalScore;
  }

  public getRoundScores(): number[] {
    return [...this.roundScores];
  }

  public addRoundScore(score: number): void {
    this.roundScores.push(score);
    this.totalScore += score;
  }

  public resetScore(): void {
    this.totalScore = 0;
    this.roundScores = [];
  }

  public getCurrentRoundNumber(): number {
    return this.roundScores.length;
  }
}
