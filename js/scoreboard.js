/**
 * Scoreboard Display Component
 * Handles rendering and updating the game scoreboard with player scores and rounds
 */

/**
 * Create and render the scoreboard structure
 * @returns {HTMLElement} The scoreboard container element
 */
function createScoreboard() {
  // Create main container
  const scoreboardContainer = document.createElement('div');
  scoreboardContainer.id = 'scoreboard';
  scoreboardContainer.className = 'scoreboard';

  // Create round display section
  const roundDisplay = document.createElement('div');
  roundDisplay.className = 'round-display';
  roundDisplay.innerHTML = '<h2>Round <span id="current-round">1</span></h2>';
  scoreboardContainer.appendChild(roundDisplay);

  // Create table container
  const tableContainer = document.createElement('div');
  tableContainer.className = 'scoreboard-table-container';

  // Create table
  const table = document.createElement('table');
  table.className = 'scoreboard-table';

  // Create header row
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  headerRow.className = 'header-row';

  // Player name header
  const playerHeader = document.createElement('th');
  playerHeader.className = 'player-header';
  playerHeader.textContent = 'Player';
  headerRow.appendChild(playerHeader);

  // Round column headers (1-10)
  for (let round = 1; round <= 10; round++) {
    const th = document.createElement('th');
    th.className = `round-header round-${round}`;
    th.textContent = `R${round}`;
    th.dataset.round = round;
    headerRow.appendChild(th);
  }

  // Total score header
  const totalHeader = document.createElement('th');
  totalHeader.className = 'total-header';
  totalHeader.textContent = 'Total';
  headerRow.appendChild(totalHeader);

  thead.appendChild(headerRow);
  table.appendChild(thead);

  // Create tbody for player rows (will be populated by updateScoreboard)
  const tbody = document.createElement('tbody');
  tbody.id = 'scoreboard-body';
  table.appendChild(tbody);

  tableContainer.appendChild(table);
  scoreboardContainer.appendChild(tableContainer);

  return scoreboardContainer;
}

/**
 * Update the scoreboard with current game state
 * @param {Object} gameState - The current game state object
 * @param {Array} gameState.players - Array of player objects with scores
 * @param {number} gameState.currentRound - The current round number (1-10)
 */
function updateScoreboard(gameState) {
  // Validate gameState
  if (!gameState || !Array.isArray(gameState.players)) {
    console.error('Invalid gameState provided to updateScoreboard');
    return;
  }

  const currentRound = gameState.currentRound || 1;

  // Update round display
  const roundElement = document.getElementById('current-round');
  if (roundElement) {
    roundElement.textContent = currentRound;
  }

  // Update active round column highlighting
  const allRoundHeaders = document.querySelectorAll('.round-header');
  allRoundHeaders.forEach((header) => {
    header.classList.remove('active-round');
    if (parseInt(header.dataset.round) === currentRound) {
      header.classList.add('active-round');
    }
  });

  // Update player rows
  const tbody = document.getElementById('scoreboard-body');
  if (!tbody) {
    console.error('Scoreboard body not found');
    return;
  }

  // Clear existing rows
  tbody.innerHTML = '';

  // Populate player rows
  gameState.players.forEach((player) => {
    const row = document.createElement('tr');
    row.className = 'player-row';
    row.id = `player-${player.id || player.name}`;

    // Player name cell
    const nameCell = document.createElement('td');
    nameCell.className = 'player-name';
    nameCell.textContent = player.name || 'Unknown';
    row.appendChild(nameCell);

    // Round score cells (1-10)
    const playerScores = player.scores || {};
    for (let round = 1; round <= 10; round++) {
      const scoreCell = document.createElement('td');
      scoreCell.className = `round-score round-${round}`;

      // Add active-round class to current round column
      if (round === currentRound) {
        scoreCell.classList.add('active-round');
      }

      // Display score if available, otherwise empty
      const score = playerScores[round];
      scoreCell.textContent = score !== undefined && score !== null ? score : '-';
      scoreCell.dataset.round = round;
      row.appendChild(scoreCell);
    }

    // Total score cell
    const totalCell = document.createElement('td');
    totalCell.className = 'player-total';
    const total = calculateTotal(playerScores);
    totalCell.textContent = total;
    row.appendChild(totalCell);

    tbody.appendChild(row);
  });
}

/**
 * Calculate total score from round scores
 * @param {Object} scores - Object with round numbers as keys and scores as values
 * @returns {number} The total score
 */
function calculateTotal(scores) {
  if (!scores || typeof scores !== 'object') {
    return 0;
  }

  return Object.values(scores).reduce((sum, score) => {
    const numScore = parseInt(score, 10);
    return !isNaN(numScore) ? sum + numScore : sum;
  }, 0);
}

// Export functions for use in main app
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createScoreboard,
    updateScoreboard,
    calculateTotal,
  };
}
