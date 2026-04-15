const GameSetup = require('../src/GameSetup');

describe('GameSetup', () => {
  let gameSetup;

  beforeEach(() => {
    gameSetup = new GameSetup();
  });

  describe('addPlayer', () => {
    test('successfully adds a player before game starts', () => {
      const result = gameSetup.addPlayer('Alice');
      expect(result.success).toBe(true);
      expect(result.playerId).toBe(1);
      expect(result.message).toContain('added successfully');
    });

    test('prevents adding players after game has started', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      gameSetup.startGame();

      const result = gameSetup.addPlayer('Charlie');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Cannot add players after game has started');
    });

    test('propagates validation errors from PlayerManager', () => {
      const result = gameSetup.addPlayer('');
      expect(result.success).toBe(false);
      expect(result.message).toContain('non-empty string');
    });
  });

  describe('startGame', () => {
    test('prevents starting with fewer than 2 players', () => {
      gameSetup.addPlayer('Alice');
      const result = gameSetup.startGame();
      expect(result.canStart).toBe(false);
      expect(result.message).toContain('at least 2 players');
    });

    test('allows starting with exactly 2 players', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      const result = gameSetup.startGame();
      expect(result.canStart).toBe(true);
    });

    test('allows starting with 3-8 players', () => {
      for (let i = 1; i <= 8; i++) {
        gameSetup.addPlayer(`Player${i}`);
      }

      // Test with 3-8 players
      for (let i = 3; i <= 8; i++) {
        const tempSetup = new GameSetup();
        for (let j = 1; j <= i; j++) {
          tempSetup.addPlayer(`Player${j}`);
        }
        const result = tempSetup.startGame();
        expect(result.canStart).toBe(true);
      }
    });

    test('includes player names in success message', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      const result = gameSetup.startGame();
      expect(result.message).toContain('Alice');
      expect(result.message).toContain('Bob');
    });
  });

  describe('getSetupState', () => {
    test('returns correct state with no players', () => {
      const state = gameSetup.getSetupState();
      expect(state.gameStarted).toBe(false);
      expect(state.playerCount).toBe(0);
      expect(state.players).toEqual([]);
      expect(state.canStartGame).toBe(false);
      expect(state.isAtMaxCapacity).toBe(false);
    });

    test('returns correct state with players added', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      const state = gameSetup.getSetupState();

      expect(state.gameStarted).toBe(false);
      expect(state.playerCount).toBe(2);
      expect(state.players).toHaveLength(2);
      expect(state.canStartGame).toBe(true);
      expect(state.isAtMaxCapacity).toBe(false);
    });

    test('returns correct state after game starts', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      gameSetup.startGame();
      const state = gameSetup.getSetupState();

      expect(state.gameStarted).toBe(true);
    });
  });

  describe('getPlayers', () => {
    test('returns all players', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      gameSetup.addPlayer('Charlie');

      const players = gameSetup.getPlayers();
      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Charlie');
    });
  });

  describe('reset', () => {
    test('clears all players and resets game state', () => {
      gameSetup.addPlayer('Alice');
      gameSetup.addPlayer('Bob');
      gameSetup.startGame();
      gameSetup.reset();

      const state = gameSetup.getSetupState();
      expect(state.gameStarted).toBe(false);
      expect(state.playerCount).toBe(0);
      expect(state.players).toEqual([]);
    });
  });

  describe('integration scenarios', () => {
    test('complete game setup flow with 4 players', () => {
      // Add players
      const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
      names.forEach(name => {
        const result = gameSetup.addPlayer(name);
        expect(result.success).toBe(true);
      });

      // Verify all players added
      expect(gameSetup.getSetupState().playerCount).toBe(4);

      // Verify players are displayed
      const playerNames = gameSetup.getPlayers().map(p => p.name);
      expect(playerNames).toEqual(names);

      // Start game
      const startResult = gameSetup.startGame();
      expect(startResult.canStart).toBe(true);

      // Verify cannot add more players after start
      const addResult = gameSetup.addPlayer('Eve');
      expect(addResult.success).toBe(false);
    });

    test('enforces 2-8 player constraint throughout workflow', () => {
      // Cannot start with 0 players
      let result = gameSetup.startGame();
      expect(result.canStart).toBe(false);

      // Cannot start with 1 player
      gameSetup.addPlayer('Alice');
      result = gameSetup.startGame();
      expect(result.canStart).toBe(false);

      // Can start with 2 players
      gameSetup.addPlayer('Bob');
      result = gameSetup.startGame();
      expect(result.canStart).toBe(true);
    });
  });
});