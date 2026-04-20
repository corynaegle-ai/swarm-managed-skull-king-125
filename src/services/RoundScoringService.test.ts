import { RoundScoringService, RoundScoringInput } from './RoundScoringService';
import { Player } from '../types/Player';
import { ScoreEngine } from '../scoring/ScoreEngine';

class MockScoreEngine implements ScoreEngine {
  scoreRound(bid: number, tricks: number, bonus: number): number {
    // Simple scoring: bid correct = 10 + bonus, bid incorrect = -5
    if (bid === tricks) {
      return 10 + bonus;
    } else {
      return -5;
    }
  }
}

describe('RoundScoringService', () => {
  let service: RoundScoringService;
  let scoreEngine: ScoreEngine;
  const players: Player[] = [
    { id: '1', name: 'Alice', totalScore: 20 },
    { id: '2', name: 'Bob', totalScore: 15 },
    { id: '3', name: 'Charlie', totalScore: 10 },
  ];

  beforeEach(() => {
    scoreEngine = new MockScoreEngine();
    service = new RoundScoringService(scoreEngine);
  });

  test('calculates round scores correctly when bids are made', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3, 1],
      tricksPerPlayer: [2, 3, 1],
      bonusPerPlayer: [0, 5, 0],
    };

    const result = service.processRoundScoring(players, input);

    expect(result.roundScores).toEqual([10, 15, 10]); // 10+0, 10+5, 10+0
  });

  test('calculates round scores when bids are missed', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3, 1],
      tricksPerPlayer: [1, 2, 3],
      bonusPerPlayer: [0, 0, 0],
    };

    const result = service.processRoundScoring(players, input);

    expect(result.roundScores).toEqual([-5, -5, -5]);
  });

  test('updates player total scores correctly', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3, 1],
      tricksPerPlayer: [2, 3, 1],
      bonusPerPlayer: [0, 5, 0],
    };

    const result = service.processRoundScoring(players, input);

    expect(result.totalScores).toEqual([30, 30, 20]); // 20+10, 15+15, 10+10
  });

  test('only allows bonus points if bid was correct', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3, 1],
      tricksPerPlayer: [1, 3, 1], // First player bid incorrect
      bonusPerPlayer: [10, 0, 0], // But trying to give bonus
    };

    expect(() => service.processRoundScoring(players, input)).toThrow(
      /Bonus points cannot be given/
    );
  });

  test('validates array lengths match player count', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3], // Too few
      tricksPerPlayer: [2, 3, 1],
      bonusPerPlayer: [0, 0, 0],
    };

    expect(() => service.processRoundScoring(players, input)).toThrow(
      /array lengths do not match/
    );
  });

  test('validates negative values', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 3, 1],
      tricksPerPlayer: [-1, 3, 1],
      bonusPerPlayer: [0, 0, 0],
    };

    expect(() => service.processRoundScoring(players, input)).toThrow(
      /Invalid tricks value/
    );
  });

  test('handles edge case of all players making bid', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 1, 3],
      tricksPerPlayer: [2, 1, 3],
      bonusPerPlayer: [5, 10, 15],
    };

    const result = service.processRoundScoring(players, input);

    expect(result.roundScores).toEqual([15, 20, 25]); // All made bid
    expect(result.totalScores).toEqual([35, 35, 35]);
  });

  test('handles edge case of no players making bid', () => {
    const input: RoundScoringInput = {
      playerBids: [2, 1, 3],
      tricksPerPlayer: [1, 2, 2],
      bonusPerPlayer: [0, 0, 0],
    };

    const result = service.processRoundScoring(players, input);

    expect(result.roundScores).toEqual([-5, -5, -5]); // All missed bid
    expect(result.totalScores).toEqual([15, 10, 5]);
  });
});
