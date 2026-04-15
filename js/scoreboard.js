/**
 * Scoreboard Module
 * Handles rendering and updating the scoreboard display component
 */

/**
 * Creates the HTML structure for the scoreboard
 * @param {Array} players - Array of player objects with name property
 * @returns {HTMLElement} The scoreboard container element
 */
function createScoreboard(players = []) {
  // Create main container
  const container = document.createElement('div');
  container.className = 'scoreboard-container';
  container.id = 'scoreboard';

  // Create header section with current round display
  const headerSection = document.createElement('div');
  headerSection.className = 'scoreboard-header';

  const roundDisplay = document.createElement('div');
  roundDisplay.className = 'current-round-display';
  roundDisplay.id = 'current-round';
  roundDisplay.innerHTML = '<span class="round-label">Current Round:</span><span class="round-number">0</span>';

  headerSection.appendChild(roundDisplay);
  container.appendChild(headerSection);

  // Create table
  const table = document.createElement('table');
  table.className = 'scoreboard-table';

  // Create table head
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'header-row';

  // Player column header
  const playerHeader = document.createElement('th');
  playerHeader.className = 'player-header';
  playerHeader.textContent = 'Player';
  headerRow.appendChild(playerHeader);

  // Round column headers (1-10)
  for (let i = 1; i <= 10; i++) {
    const roundHeader = document.createElement('th');
    roundHeader.className = 'round-header';
    roundHeader.dataset.round = i;
    roundHeader.textContent = `R${i}`;
    headerRow.appendChild(roundHeader);
  }

  // Total column header
  const totalHeader = document.createElement('th');
  totalHeader.className = 'total-header';
  totalHeader.textContent = 'Total';
  headerRow.appendChild(totalHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create table body
  const tbody = document.createElement('tbody');
  tbody.className = 'scoreboard-body';

  // Add player rows
  players.forEach((player) => {
    const row = document.createElement('tr');
    row.className = 'player-row';
    row.dataset.playerName = player.name;

    // Player name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'player-name-cell';
    nameCell.textContent = player.name;
    row.appendChild(nameCell);

    // Round score cells (1-10)
    for (let i = 1; i <= 10; i++) {
      const scoreCell = document.createElement('td');
      scoreCell.className = 'round-score-cell';
      scoreCell.dataset.round = i;
      scoreCell.textContent = '-';
      row.appendChild(scoreCell);
    }

    // Total score cell
    const totalCell = document.createElement('td');
    totalCell.className = 'total-score-cell';
    totalCell.dataset.playerName = player.name;
    totalCell.textContent = '0';
    row.appendChild(totalCell);

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  container.appendChild(table);

  return container;
}

/**
 * Updates the scoreboard with current game state
 * @param {Object} gameState - Game state object containing:
 *   - players: Array of player objects with scores
 *   - currentRound: Current round number (1-10)
 *   - roundScores: Object mapping player names to round scores
 */
function updateScoreboard(gameState) {
  if (!gameState) {
    console.warn('updateScoreboard: invalid gameState provided');
    return;
  }

  const scoreboard = document.getElementById('scoreboard');
  if (!scoreboard) {
    console.warn('updateScoreboard: scoreboard element not found in DOM');
    return;
  }

  // Update current round display
  const currentRoundElement = document.getElementById('current-round');
  if (currentRoundElement) {
    const roundNumber = currentRoundElement.querySelector('.round-number');
    if (roundNumber) {
      roundNumber.textContent = gameState.currentRound || 0;
    }
  }

  // Update active round column highlighting
  const allRoundHeaders = document.querySelectorAll('.round-header');
  allRoundHeaders.forEach((header) => {
    header.classList.remove('active-round');
    if (parseInt(header.dataset.round) === gameState.currentRound) {
      header.classList.add('active-round');
    }
  });

  // Update player scores
  if (gameState.players && Array.isArray(gameState.players)) {
    gameState.players.forEach((player) => {
      const playerRow = document.querySelector(`tr[data-player-name="${player.name}"]`);
      if (!playerRow) return;

      // Update round scores
      if (player.roundScores) {
        Object.entries(player.roundScores).forEach(([round, score]) => {
          const roundCell = playerRow.querySelector(`td[data-round="${round}"]`);
          if (roundCell) {
            roundCell.textContent = score !== undefined && score !== null ? score : '-';
          }
        });
      }

      // Update total score
      const totalCell = playerRow.querySelector('.total-score-cell');
      if (totalCell) {
        const total = calculatePlayerTotal(player);
        totalCell.textContent = total;
      }
    });
  }
}

/**
 * Calculates the total score for a player
 * @param {Object} player - Player object with roundScores
 * @returns {number} Total score
 */
function calculatePlayerTotal(player) {
  if (!player.roundScores) return 0;

  return Object.values(player.roundScores).reduce((sum, score) => {
    const numScore = parseInt(score, 10);
    return !isNaN(numScore) ? sum + numScore : sum;
  }, 0);
}

/**
 * Highlights the active round column
 * @param {number} roundNumber - The round number to highlight
 */
function highlightActiveRound(roundNumber) {
  const allRoundCells = document.querySelectorAll('[data-round]');
  allRoundCells.forEach((cell) => {
    cell.classList.remove('active-round');
    if (parseInt(cell.dataset.round) === roundNumber) {
      cell.classList.add('active-round');
    }
  });
}

// Export functions for use in main application
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createScoreboard,
    updateScoreboard,
    highlightActiveRound
  };
}
