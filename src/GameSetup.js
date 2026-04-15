const PlayerManager = require('./PlayerManager');

/**
 * GameSetup - Orchestrates the game setup flow
 * Manages the state transitions from player selection to game start
 */
class GameSetup {
  constructor() {
    this.playerManager = new PlayerManager();
    this.gameStarted = false;
  }

  /**
   * Add a player to the game
   * @param {string} name - Player name
   * @returns {object} - {success: boolean, playerId: number|null, message: string}
   */
  addPlayer(name) {
    if (this.gameStarted) {
      return { success: false, playerId: null, message: 'Cannot add players after game has started' };
    }

    const result = this.playerManager.addPlayer(name);
    return {
      success: result.success,
      playerId: result.playerId,
      message: result.error || `Player "${name}" added successfully (ID: ${result.playerId})`
    };
  }

  /**
   * Attempt to start the game
   * @returns {object} - {canStart: boolean, message: string}
   */
  startGame() {
    const validation = this.playerManager.canStartGame();
    if (!validation.canStart) {
      return { canStart: false, message: validation.message };
    }

    this.gameStarted = true;
    return {
      canStart: true,
      message: `Game started with ${this.playerManager.getPlayerCount()} players: ${this.playerManager.getPlayerNames().join(', ')}`
    };
  }

  /**
   * Get current setup state
   * @returns {object} - State information
   */
  getSetupState() {
    return {
      gameStarted: this.gameStarted,
      playerCount: this.playerManager.getPlayerCount(),
      players: this.playerManager.getPlayers(),
      canStartGame: this.playerManager.canStartGame().canStart,
      isAtMaxCapacity: this.playerManager.isAtMaxCapacity()
    };
  }

  /**
   * Get all players
   * @returns {array} - Array of player objects
   */
  getPlayers() {
    return this.playerManager.getPlayers();
  }

  /**
   * Reset the setup (for testing)
   */
  reset() {
    this.playerManager.reset();
    this.gameStarted = false;
  }
}

module.exports = GameSetup;