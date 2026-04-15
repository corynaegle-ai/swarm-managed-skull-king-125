"""Main game class for Skull King.

Manages game state and player setup.
"""

from enum import Enum
from typing import List
from player_manager import PlayerManager, Player


class GameState(Enum):
    """Enumeration of possible game states."""
    SETUP = "setup"
    IN_PROGRESS = "in_progress"
    FINISHED = "finished"


class Game:
    """Manages a single game of Skull King."""

    def __init__(self):
        """Initialize a new game in setup state."""
        self.player_manager = PlayerManager()
        self.state = GameState.SETUP
        self.current_round = 0

    def add_player(self, name: str) -> Player:
        """Add a player to the current game.
        
        Can only add players while in SETUP state.
        
        Args:
            name: The player's name
            
        Returns:
            The created Player object
            
        Raises:
            ValueError: If not in SETUP state, name invalid, or max players reached
        """
        if self.state != GameState.SETUP:
            raise ValueError("Can only add players during game setup")
        
        return self.player_manager.add_player(name)

    def get_players(self) -> List[Player]:
        """Get all players in the current game.
        
        Returns:
            List of Player objects
        """
        return self.player_manager.get_players()

    def get_player_names(self) -> List[str]:
        """Get all player names for display.
        
        Returns:
            List of player names in order they were added
        """
        return self.player_manager.get_player_names()

    def get_player_count(self) -> int:
        """Get the current number of players.
        
        Returns:
            Number of players
        """
        return self.player_manager.get_player_count()

    def can_start_game(self) -> bool:
        """Check if game can be started.
        
        Requires 2-8 players.
        
        Returns:
            True if game can be started, False otherwise
        """
        return self.player_manager.can_start_game()

    def start_game(self) -> None:
        """Start the game after setup phase.
        
        Raises:
            ValueError: If game cannot be started (wrong player count or wrong state)
        """
        if not self.can_start_game():
            raise ValueError(
                f"Cannot start game with {self.get_player_count()} players. "
                f"Must have 2-8 players."
            )
        
        if self.state != GameState.SETUP:
            raise ValueError("Game is not in setup state")
        
        self.state = GameState.IN_PROGRESS
        self.current_round = 1

    def finish_game(self) -> None:
        """Mark the game as finished."""
        self.state = GameState.FINISHED
