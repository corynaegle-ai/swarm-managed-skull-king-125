import { GameFlowManager } from '../src/game/gameFlow';
import { Player } from '../src/types/player';
import { GamePhase, GameStatus } from '../src/types/game';

describe('GameFlowManager', () => {
  let gameFlow: GameFlowManager;
  let players: Player[];

  beforeEach(() => {
    players = [
      { id: 'p1', name: 'Player 1', score: 0 },
      { id: 'p2', name: 'Player 2', score: 0 },
      { id: 'p3', name: 'Player 3', score: 0 }
    ];
    gameFlow = new GameFlowManager(players);
  });

  describe('Game Initialization', () => {
    it('should initialize with setup phase', () => {
      expect(gameFlow.getCurrentPhase()).toBe('setup');
    });

    it('should start at round 1', () => {
      expect(gameFlow.getCurrentRound()).toBe(1);
    });

    it('should have in_progress status', () => {
      expect(gameFlow.getGameStatus()).toBe('in_progress');
    });

    it('should throw error with invalid player count', () => {
      expect(() => new GameFlowManager([])).toThrow();
      expect(() => new GameFlowManager(new Array(7).fill({ id: '1', name: 'P', score: 0 }))).toThrow();
    });
  });

  describe('Acceptance Criteria 1: Progresses through setup, bidding, scoring phases', () => {
    it('should progress from setup to bidding', () => {
      expect(gameFlow.getCurrentPhase()).toBe('setup');
      gameFlow.completeSetup(true);
      const success = gameFlow.advancePhase();
      expect(success).toBe(true);
      expect(gameFlow.getCurrentPhase()).toBe('bidding');
    });

    it('should progress from bidding to scoring', () => {
      gameFlow.completeSetup(true);
      gameFlow.advancePhase();
      expect(gameFlow.getCurrentPhase()).toBe('bidding');

      const bids = { p1: 3, p2: 2, p3: 4 };
      gameFlow.completeBidding(bids);
      const success = gameFlow.advancePhase();
      expect(success).toBe(true);
      expect(gameFlow.getCurrentPhase()).toBe('scoring');
    });

    it('should progress through all three phases in sequence', () => {
      // Phase 1: Setup
      expect(gameFlow.getCurrentPhase()).toBe('setup');
      gameFlow.completeSetup(true);
      gameFlow.advancePhase();

      // Phase 2: Bidding
      expect(gameFlow.getCurrentPhase()).toBe('bidding');
      const bids = { p1: 3, p2: 2, p3: 4 };
      gameFlow.completeBidding(bids);
      gameFlow.advancePhase();

      // Phase 3: Scoring
      expect(gameFlow.getCurrentPhase()).toBe('scoring');
      const tricks = { p1: 3, p2: 1, p3: 4 };
      const scores = { p1: 10, p2: 0, p3: 20 };
      gameFlow.completeScoring(tricks, scores);
    });
  });

  describe('Acceptance Criteria 2: Advances to next round after scoring complete', () => {
    it('should advance to round 2 after completing round 1', () => {
      completeFullRound(gameFlow);
      gameFlow.advancePhase();

      expect(gameFlow.getCurrentRound()).toBe(2);
      expect(gameFlow.getCurrentPhase()).toBe('setup');
      expect(gameFlow.getGameStatus()).toBe('in_progress');
    });

    it('should complete multiple rounds sequentially', () => {
      for (let i = 1; i <= 5; i++) {
        expect(gameFlow.getCurrentRound()).toBe(i);
        completeFullRound(gameFlow);
        gameFlow.advancePhase();
        expect(gameFlow.getCurrentRound()).toBe(i + 1);
      }
      expect(gameFlow.getCurrentRound()).toBe(6);
    });

    it('should return true when advancing to next round within 10 rounds', () => {
      completeFullRound(gameFlow);
      const success = gameFlow.advancePhase();
      expect(success).toBe(true);
      expect(gameFlow.getCurrentRound()).toBe(2);
    });
  });

  describe('Acceptance Criteria 3: Shows game completion after round 10', () => {
    it('should complete game after 10 rounds', () => {
      // Complete 9 full rounds
      for (let i = 1; i < 10; i++) {
        completeFullRound(gameFlow);
        const success = gameFlow.advancePhase();
        expect(success).toBe(true);
        expect(gameFlow.getGameStatus()).toBe('in_progress');
      }

      // Complete round 10
      expect(gameFlow.getCurrentRound()).toBe(10);
      completeFullRound(gameFlow);
      const success = gameFlow.advancePhase();

      expect(success).toBe(false);
      expect(gameFlow.isGameComplete()).toBe(true);
      expect(gameFlow.getGameStatus()).toBe('completed');
      expect(gameFlow.getCurrentPhase()).toBe('complete');
    });

    it('should mark game as completed when reaching round 10 completion', () => {
      // Fast-forward to round 10
      for (let i = 1; i < 10; i++) {
        completeFullRound(gameFlow);
        gameFlow.advancePhase();
      }

      expect(gameFlow.isGameComplete()).toBe(false);
      expect(gameFlow.getCurrentRound()).toBe(10);

      completeFullRound(gameFlow);
      gameFlow.advancePhase();

      expect(gameFlow.isGameComplete()).toBe(true);
    });
  });

  describe('Acceptance Criteria 4: Displays final winner and scores', () => {
    it('should have no winner before game completion', () => {
      expect(gameFlow.getWinner()).toBeNull();
      expect(gameFlow.getFinalScores()).toBeNull();
    });

    it('should calculate winner after game completion', () => {
      completeGameWith10Rounds(gameFlow, [
        { p1: 10, p2: 5, p3: 8 },
        { p1: 12, p2: 7, p3: 6 },
        { p1: 8, p2: 10, p3: 9 },
        { p1: 9, p2: 8, p3: 11 },
        { p1: 15, p2: 6, p3: 7 },
        { p1: 10, p2: 9, p3: 8 },
        { p1: 11, p2: 10, p3: 9 },
        { p1: 14, p2: 8, p3: 7 },
        { p1: 13, p2: 9, p3: 8 },
        { p1: 12, p2: 11, p3: 10 }
      ]);

      const winner = gameFlow.getWinner();
      expect(winner).not.toBeNull();
      expect(winner?.id).toBe('p1'); // p1 should have highest total score
    });

    it('should display final scores for all players', () => {
      const roundScores = [
        { p1: 10, p2: 5, p3: 8 },
        { p1: 12, p2: 7, p3: 6 },
        { p1: 8, p2: 10, p3: 9 },
        { p1: 9, p2: 8, p3: 11 },
        { p1: 15, p2: 6, p3: 7 },
        { p1: 10, p2: 9, p3: 8 },
        { p1: 11, p2: 10, p3: 9 },
        { p1: 14, p2: 8, p3: 7 },
        { p1: 13, p2: 9, p3: 8 },
        { p1: 12, p2: 11, p3: 10 }
      ];

      completeGameWith10Rounds(gameFlow, roundScores);

      const finalScores = gameFlow.getFinalScores();
      expect(finalScores).not.toBeNull();
      expect(finalScores?.['p1']).toBe(114);
      expect(finalScores?.['p2']).toBe(83);
      expect(finalScores?.['p3']).toBe(83);
    });

    it('should provide game summary with winner and scores', () => {
      completeGameWith10Rounds(gameFlow, [
        { p1: 10, p2: 5, p3: 8 },
        { p1: 12, p2: 7, p3: 6 },
        { p1: 8, p2: 10, p3: 9 },
        { p1: 9, p2: 8, p3: 11 },
        { p1: 15, p2: 6, p3: 7 },
        { p1: 10, p2: 9, p3: 8 },
        { p1: 11, p2: 10, p3: 9 },
        { p1: 14, p2: 8, p3: 7 },
        { p1: 13, p2: 9, p3: 8 },
        { p1: 12, p2: 11, p3: 10 }
      ]);

      const summary = gameFlow.getGameSummary();
      expect(summary.winner).not.toBeNull();
      expect(summary.winner?.id).toBe('p1');
      expect(summary.finalScores).not.toBeNull();
      expect(summary.totalRounds).toBe(10);
    });
  });

  describe('Phase Validation', () => {
    it('should prevent phase actions outside their phase', () => {
      expect(() => gameFlow.completeBidding({ p1: 3, p2: 2, p3: 4 })).toThrow();
      expect(() => gameFlow.completeScoring({}, {})).toThrow();
    });
  });
});

// Helper function to complete a full round
function completeFullRound(gameFlow: GameFlowManager) {
  // Setup phase
  gameFlow.completeSetup(true);
  gameFlow.advancePhase();

  // Bidding phase
  const bids = { p1: 3, p2: 2, p3: 4 };
  gameFlow.completeBidding(bids);
  gameFlow.advancePhase();

  // Scoring phase
  const tricks = { p1: 3, p2: 1, p3: 4 };
  const scores = { p1: 10, p2: 0, p3: 20 };
  gameFlow.completeScoring(tricks, scores);
}

// Helper function to complete game with specific scores
function completeGameWith10Rounds(gameFlow: GameFlowManager, roundScores: Record<string, number>[]) {
  for (let round = 0; round < 10; round++) {
    // Setup phase
    gameFlow.completeSetup(true);
    gameFlow.advancePhase();

    // Bidding phase
    const bids = { p1: 3, p2: 2, p3: 4 };
    gameFlow.completeBidding(bids);
    gameFlow.advancePhase();

    // Scoring phase with specific scores
    const tricks = { p1: 3, p2: 1, p3: 4 };
    const scores = roundScores[round];
    gameFlow.completeScoring(tricks, scores);

    // Advance to next round
    if (round < 9) {
      gameFlow.advancePhase();
    }
  }

  // Complete the final round advancement to finish game
  gameFlow.advancePhase();
}
