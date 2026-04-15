# Skull King Game - Player Setup Module

Implementation of player setup functionality for the Skull King card game.

## Features

### Player Management
- Add players one at a time with names
- Each player receives a unique ID upon creation
- Enforce 2-8 player limit
- Retrieve player names and data throughout the game

### Game Setup
- Game starts in SETUP state
- Players can only be added during SETUP
- Game requires 2-8 players to start
- Clear validation before game begins

## Module Structure

### `player_manager.py`
Core player management classes:
- **Player**: Data class representing a single player with name and unique ID
- **PlayerManager**: Manages the collection of players with validation

### `game.py`
Game state management:
- **Game**: Main game class managing state and player setup
- **GameState**: Enumeration of game states (SETUP, IN_PROGRESS, FINISHED)

### `test_player_manager.py`
Comprehensive tests for player management:
- Player creation and ID assignment
- Player name validation
- Player count validation (2-8 limits)
- Duplicate name detection

### `test_game.py`
Integration tests for game functionality:
- Game state transitions
- Player addition during setup
- Game start validation
- Player name retrieval and display

## Acceptance Criteria

1. **Can add players one at a time with names** ✓
   - Players added via `add_player()` method
   - Each player receives unique ID
   - Names preserved throughout game

2. **Enforces 2-8 player limit** ✓
   - Minimum: 2 players required to start game
   - Maximum: 8 players enforced on add
   - Validation at both add and start phases

3. **Cannot start game with fewer than 2 players** ✓
   - `can_start_game()` returns False with < 2 players
   - `start_game()` raises ValueError with insufficient players
   - Game remains in SETUP state if start fails

4. **Player names are displayed throughout the game** ✓
   - `get_player_names()` available in all states
   - `get_players()` returns full player data
   - Names maintained in insertion order

## Usage Example

```python
from game import Game

# Create new game
game = Game()

# Add players during setup
game.add_player("Alice")
game.add_player("Bob")
game.add_player("Charlie")

# Check if game can start
if game.can_start_game():
    game.start_game()

# Display player names
print(game.get_player_names())  # ["Alice", "Bob", "Charlie"]
```

## Testing

Run all tests:
```bash
pytest test_player_manager.py test_game.py -v
```

Run specific test file:
```bash
pytest test_player_manager.py -v
pytest test_game.py -v
```

Run with coverage:
```bash
pytest --cov=player_manager --cov=game test_player_manager.py test_game.py
```

## Error Handling

- **Empty/invalid names**: ValueError raised
- **Duplicate names**: ValueError raised (case-insensitive)
- **Too many players**: ValueError raised when adding > 8th player
- **Invalid game state**: ValueError raised when starting with < 2 players
- **Adding players outside setup**: ValueError raised after game starts
