/**
 * PlayerManager - Manages player addition, validation, and state
 * Enforces game constraints: 2-8 players, unique names, unique IDs
 */
class PlayerManager {
  constructor() {
    this.players = [];
    this.nextId = 1;
    this.MAX_PLAYERS = 8;
    this.MIN_PLAYERS = 2;
  }

  /**
   * Add a player with the given name
   * @param {string} name - Player name (trimmed, non-empty)
   * @returns {object} - {success: boolean, playerId: number|null, error: string|null}
   */
  addPlayer(name) {
    // Validation: name is provided and non-empty
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return { success: false, playerId: null, error: 'Player name must be a non-empty string' };
    }

    const trimmedName = name.trim();

    // Validation: check for duplicate names
    if (this.players.some(p => p.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { success: false, playerId: null, error: `Player with name "${trimmedName}" already exists` };
    }

    // Validation: max players limit
    if (this.players.length >= this.MAX_PLAYERS) {
      return { success: false, playerId: null, error: `Cannot add more than ${this.MAX_PLAYERS} players` };
    }

    // Create new player with unique ID
    const player = {
      id: this.nextId,
      name: trimmedName
    };

    this.players.push(player);
    this.nextId++;

    return { success: true, playerId: player.id, error: null };
  }

  /**
   * Get all players
   * @returns {array} - Array of player objects
   */
  getPlayers() {
    return [...this.players]; // Return a copy to prevent external mutations
  }

  /**
   * Get player by ID
   * @param {number} playerId - The player ID
   * @returns {object|null} - Player object or null if not found
   */
  getPlayerById(playerId) {
    return this.players.find(p => p.id === playerId) || null;
  }

  /**
   * Check if game can start (minimum players requirement)
   * @returns {object} - {canStart: boolean, message: string}
   */
  canStartGame() {
    const playerCount = this.players.length;
    if (playerCount < this.MIN_PLAYERS) {
      return {
        canStart: false,
        message: `Need at least ${this.MIN_PLAYERS} players to start. Currently have ${playerCount}.`
      };
    }
    return { canStart: true, message: 'Game can start' };
  }

  /**
   * Get the number of players currently added
   * @returns {number}
   */
  getPlayerCount() {
    return this.players.length;
  }

  /**
   * Check if the player list is at maximum capacity
   * @returns {boolean}
   */
  isAtMaxCapacity() {
    return this.players.length >= this.MAX_PLAYERS;
  }

  /**
   * Get player names in order
   * @returns {array} - Array of player names
   */
  getPlayerNames() {
    return this.players.map(p => p.name);
  }

  /**
   * Reset the player manager (for testing or new game)
   */
  reset() {
    this.players = [];
    this.nextId = 1;
  }
}

module.exports = PlayerManager;