export interface Player {
  id: string;
  name: string;
  totalScore: number;
  roundBid?: number;
  roundTricks?: number;
  roundBonus?: number;
}
