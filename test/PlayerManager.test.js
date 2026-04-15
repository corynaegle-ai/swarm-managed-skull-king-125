const PlayerManager = require('../src/PlayerManager');

describe('PlayerManager', () => {
  let playerManager;

  beforeEach(() => {
    playerManager = new PlayerManager();
  });

  describe('addPlayer', () => {
    test('successfully adds a player with a name', () => {
      const result = playerManager.addPlayer('Alice');
      expect(result.success).toBe(true);
      expect(result.playerId).toBe(1);
      expect(result.error).toBeNull();
    });

    test('assigns unique IDs to multiple players', () => {
      const result1 = playerManager.addPlayer('Alice');
      const result2 = playerManager.addPlayer('Bob');
      const result3 = playerManager.addPlayer('Charlie');

      expect(result1.playerId).toBe(1);
      expect(result2.playerId).toBe(2);
      expect(result3.playerId).toBe(3);
    });

    test('rejects empty or whitespace-only names', () => {
      const result1 = playerManager.addPlayer('');
      const result2 = playerManager.addPlayer('   ');
      const result3 = playerManager.addPlayer(null);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });

    test('rejects duplicate player names (case-insensitive)', () => {
      playerManager.addPlayer('Alice');
      const result = playerManager.addPlayer('alice');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });

    test('enforces maximum 8 players limit', () => {
      for (let i = 1; i <= 8; i++) {
        const result = playerManager.addPlayer(`Player${i}`);
        expect(result.success).toBe(true);
      }

      const ninthResult = playerManager.addPlayer('Player9');
      expect(ninthResult.success).toBe(false);
      expect(ninthResult.error).toContain('Cannot add more than 8 players');
    });

    test('trims whitespace from player names', () => {
      const result = playerManager.addPlayer('  Alice  ');
      expect(result.success).toBe(true);

      const players = playerManager.getPlayers();
      expect(players[0].name).toBe('Alice');
    });
  });

  describe('getPlayers', () => {
    test('returns empty array initially', () => {
      expect(playerManager.getPlayers()).toEqual([]);
    });

    test('returns all added players in order', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.addPlayer('Charlie');

      const players = playerManager.getPlayers();
      expect(players).toHaveLength(3);
      expect(players[0].name).toBe('Alice');
      expect(players[1].name).toBe('Bob');
      expect(players[2].name).toBe('Charlie');
    });

    test('returns a copy to prevent external mutations', () => {
      playerManager.addPlayer('Alice');
      const players = playerManager.getPlayers();
      players[0].name = 'Hacker';

      const actualPlayers = playerManager.getPlayers();
      expect(actualPlayers[0].name).toBe('Alice');
    });
  });

  describe('getPlayerById', () => {
    test('returns player with matching ID', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');

      const player = playerManager.getPlayerById(2);
      expect(player).not.toBeNull();
      expect(player.name).toBe('Bob');
    });

    test('returns null for non-existent player ID', () => {
      playerManager.addPlayer('Alice');
      const player = playerManager.getPlayerById(999);
      expect(player).toBeNull();
    });
  });

  describe('canStartGame', () => {
    test('returns false with fewer than 2 players', () => {
      playerManager.addPlayer('Alice');
      const result = playerManager.canStartGame();
      expect(result.canStart).toBe(false);
    });

    test('returns true with exactly 2 players', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      const result = playerManager.canStartGame();
      expect(result.canStart).toBe(true);
    });

    test('returns true with 3-8 players', () => {
      for (let i = 1; i <= 8; i++) {
        playerManager.addPlayer(`Player${i}`);
      }

      for (let i = 3; i <= 8; i++) {
        const tempManager = new PlayerManager();
        for (let j = 1; j <= i; j++) {
          tempManager.addPlayer(`Player${j}`);
        }
        const result = tempManager.canStartGame();
        expect(result.canStart).toBe(true);
      }
    });
  });

  describe('getPlayerCount', () => {
    test('returns 0 initially', () => {
      expect(playerManager.getPlayerCount()).toBe(0);
    });

    test('increments with each added player', () => {
      expect(playerManager.getPlayerCount()).toBe(0);
      playerManager.addPlayer('Alice');
      expect(playerManager.getPlayerCount()).toBe(1);
      playerManager.addPlayer('Bob');
      expect(playerManager.getPlayerCount()).toBe(2);
    });
  });

  describe('isAtMaxCapacity', () => {
    test('returns false when below max', () => {
      for (let i = 1; i < 8; i++) {
        playerManager.addPlayer(`Player${i}`);
        expect(playerManager.isAtMaxCapacity()).toBe(false);
      }
    });

    test('returns true when at max (8 players)', () => {
      for (let i = 1; i <= 8; i++) {
        playerManager.addPlayer(`Player${i}`);
      }
      expect(playerManager.isAtMaxCapacity()).toBe(true);
    });
  });

  describe('getPlayerNames', () => {
    test('returns names in order', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.addPlayer('Charlie');

      const names = playerManager.getPlayerNames();
      expect(names).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    test('returns empty array when no players', () => {
      expect(playerManager.getPlayerNames()).toEqual([]);
    });
  });

  describe('reset', () => {
    test('clears all players and resets ID counter', () => {
      playerManager.addPlayer('Alice');
      playerManager.addPlayer('Bob');
      playerManager.reset();

      expect(playerManager.getPlayerCount()).toBe(0);
      expect(playerManager.getPlayers()).toEqual([]);

      // Verify ID counter is reset
      const result = playerManager.addPlayer('Charlie');
      expect(result.playerId).toBe(1);
    });
  });
});