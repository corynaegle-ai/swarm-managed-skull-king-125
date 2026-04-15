import { GameFlowManager, GamePhase } from '../GameFlowManager';
import { Player } from '../Player';
import { Round } from '../Round';

describe('GameFlowManager', () => {
  let gameFlow: GameFlowManager;
  let players: Player[];

  beforeEach(() => {
    players = [
      new Player('p1', 'Player 1'),
      new Player('p2', 'Player 2'),
      new Player('p3', 'Player 3')
    ];
    gameFlow = new GameFlowManager(players);
  });

  describe('Initialization', () => {
    it('should initialize with SETUP phase', () => {
      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.SETUP);
    });

    it('should start at round 1', () => {
      expect(gameFlow.getCurrentRound()).toBe(1);
    });

    it('should have max rounds set to 10', () => {
      expect(gameFlow.getMaxRounds()).toBe(10);
    });

    it('should initialize with provided players', () => {
      expect(gameFlow.getPlayers()).toEqual(players);
    });

    it('should throw error if no players provided', () => {
      expect(() => new GameFlowManager([])).toThrow(
        'At least one player is required'
      );
    });
  });

  describe('Criterion 1: Progresses through setup, bidding, scoring phases', () => {
    it('should progress from SETUP to BIDDING', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.BIDDING);
    });

    it('should progress from BIDDING to SCORING', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.BIDDING);
      gameFlow.completeBidding();
      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.SCORING);
    });

    it('should not allow setup completion outside SETUP phase', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      expect(() => gameFlow.completeSetup()).toThrow(
        'Setup can only be completed in SETUP phase'
      );
    });

    it('should not allow bidding completion outside BIDDING phase', () => {
      expect(() => gameFlow.completeBidding()).toThrow(
        'Bidding can only be completed in BIDDING phase'
      );
    });
  });

  describe('Criterion 2: Advances to next round after scoring complete', () => {
    it('should advance to round 2 after completing round 1 scoring', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      gameFlow.completeBidding();
      const round1 = new Round(1);
      gameFlow.completeScoring(round1);

      expect(gameFlow.getCurrentRound()).toBe(2);
    });

    it('should return to BIDDING phase after completing scoring', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      gameFlow.completeBidding();
      const round1 = new Round(1);
      gameFlow.completeScoring(round1);

      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.BIDDING);
    });

    it('should advance through multiple rounds correctly', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      for (let i = 1; i < 10; i++) {
        expect(gameFlow.getCurrentRound()).toBe(i);
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      expect(gameFlow.getCurrentRound()).toBe(10);
    });
  });

  describe('Criterion 3: Shows game completion after round 10', () => {
    it('should mark game as complete after round 10 scoring', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      expect(gameFlow.isGameComplete()).toBe(true);
    });

    it('should transition to COMPLETE phase after round 10', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      expect(gameFlow.getCurrentPhase()).toBe(GamePhase.COMPLETE);
    });

    it('should store all 10 rounds', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      expect(gameFlow.getRounds().length).toBe(10);
    });
  });

  describe('Criterion 4: Displays final winner and scores', () => {
    it('should determine game winner based on total score', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Set up player scores
      players[0].addRoundScore(100);
      players[1].addRoundScore(80);
      players[2].addRoundScore(60);

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      const winner = gameFlow.getGameWinner();
      expect(winner).toBe(players[0]);
    });

    it('should provide final scores in descending order', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Set up player scores
      players[0].addRoundScore(100);
      players[1].addRoundScore(150);
      players[2].addRoundScore(80);

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      const finalScores = gameFlow.getFinalScores();
      expect(finalScores[0].score).toBe(150);
      expect(finalScores[1].score).toBe(100);
      expect(finalScores[2].score).toBe(80);
    });

    it('should return game summary with winner and scores', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();

      // Set up player scores
      players[0].addRoundScore(100);
      players[1].addRoundScore(80);
      players[2].addRoundScore(60);

      // Complete 10 rounds
      for (let i = 1; i <= 10; i++) {
        gameFlow.completeBidding();
        const round = new Round(i);
        gameFlow.completeScoring(round);
      }

      const summary = gameFlow.getGameSummary();
      expect(summary.winner).toBe(players[0]);
      expect(summary.finalScores.length).toBe(3);
      expect(summary.totalRoundsPlayed).toBe(10);
    });

    it('should throw error when getting winner before game completion', () => {
      expect(() => gameFlow.getGameWinner()).toThrow(
        'Game is not complete yet'
      );
    });

    it('should throw error when getting final scores before game completion', () => {
      expect(() => gameFlow.getFinalScores()).toThrow(
        'Game is not complete yet'
      );
    });
  });

  describe('Phase Transition Safety', () => {
    it('should not allow scoring completion outside SCORING phase', () => {
      const round = new Round(1);
      expect(() => gameFlow.completeScoring(round)).toThrow(
        'Scoring can only be completed in SCORING phase'
      );
    });

    it('should prevent setup initialization outside SETUP phase', () => {
      gameFlow.initializeSetup();
      gameFlow.completeSetup();
      expect(() => gameFlow.initializeSetup()).toThrow(
        'Game setup can only be initialized in SETUP phase'
      );
    });
  });
});
