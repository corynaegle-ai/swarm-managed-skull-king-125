# Game Flow Management

## Overview

This module implements comprehensive game flow management for a turn-based card game (Skull King). It handles progression through game phases, round management, and game completion after 10 rounds.

## Architecture

### Core Components

#### GameFlowManager (`src/game/gameFlow.ts`)

The main class responsible for managing:
- Game state and phase transitions
- Round progression (1-10 rounds)
- Phase flow: setup → bidding → scoring → next round
- Game completion and winner determination

#### Type Definitions (`src/types/`)

- `game.ts`: Game-related types (GamePhase, GameState, GameRound, etc.)
- `player.ts`: Player interface

## Game Flow

### Phase Progression

1. **Setup Phase**: Initialize round, deal cards
2. **Bidding Phase**: Players place bids
3. **Scoring Phase**: Calculate tricks and scores
4. **Round Completion**: Advance to next round or complete game

### Round Structure

Each round consists of:
- Round number (1-10)
- Three phases with completion tracking
- Setup data (skulls dealt status)
- Bidding data (player bids)
- Scoring data (tricks won, round scores)

### Game Completion

After round 10:
- Game status changes to "completed"
- Winner is determined (highest total score)
- Final scores for all players are calculated and displayed

## API Usage

### Initialization

```typescript
const players = [
  { id: 'p1', name: 'Player 1', score: 0 },
  { id: 'p2', name: 'Player 2', score: 0 },
  { id: 'p3', name: 'Player 3', score: 0 }
];

const gameFlow = new GameFlowManager(players);
```

### Phase Progression

```typescript
// Setup phase
gameFlow.completeSetup(true); // true = skulls dealt
gameFlow.advancePhase(); // → bidding phase

// Bidding phase
gameFlow.completeBidding({ p1: 3, p2: 2, p3: 4 });
gameFlow.advancePhase(); // → scoring phase

// Scoring phase
gameFlow.completeScoring(
  { p1: 3, p2: 1, p3: 4 }, // tricks
  { p1: 10, p2: 0, p3: 20 }  // round scores
);
gameFlow.advancePhase(); // → next round or game completion
```

### State Queries

```typescript
// Current state
gameFlow.getCurrentPhase(); // returns: 'setup' | 'bidding' | 'scoring' | 'complete'
gameFlow.getCurrentRound(); // returns: 1-10
gameFlow.getGameStatus(); // returns: 'in_progress' | 'completed'
gameFlow.isGameComplete(); // returns: boolean

// Game completion info
gameFlow.getWinner(); // returns: Player | null
gameFlow.getFinalScores(); // returns: Record<string, number> | null
gameFlow.getGameSummary(); // returns: complete game summary

// Current round data
gameFlow.getCurrentRoundData(); // returns: GameRound
gameFlow.getGameState(); // returns: complete GameState
```

## Acceptance Criteria

✅ **Criterion 1**: Progresses through setup, bidding, scoring phases
- Implemented in `advancePhase()` method
- Validated by phase transition logic in `transitionToPhase()`

✅ **Criterion 2**: Advances to next round after scoring complete
- Implemented in `advanceRound()` method
- Handles round 1-9 transitions
- Resets phase to 'setup' for new round

✅ **Criterion 3**: Shows game completion after round 10
- Implemented in `completeGame()` method
- Triggered after scoring phase of round 10
- Game status changes to 'completed'
- Current phase changes to 'complete'

✅ **Criterion 4**: Displays final winner and scores
- Winner calculation in `calculateWinner()` method
- Final scores calculation in `calculateFinalScores()` method
- Both available via `getWinner()`, `getFinalScores()`, and `getGameSummary()`

## Testing

Comprehensive test suite in `tests/gameFlow.test.ts` covers:
- Game initialization
- Phase progression (all three criteria)
- Round advancement
- Game completion
- Winner and score calculation
- Error handling

Run tests with:
```bash
npm test
```

## Error Handling

- Invalid player count (must be 2-6 players)
- Invalid phase transitions
- Phase action validation (prevent actions outside their phase)

## Constants

- `TOTAL_ROUNDS`: 10
- `MAX_PLAYERS`: 6
- `MIN_PLAYERS`: 2
