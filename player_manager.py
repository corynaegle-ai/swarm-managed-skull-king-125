"""Player management for Skull King game.

Handles player creation, validation, and management throughout the game.
"""

import uuid
from typing import List, Optional


class Player:
    """Represents a player in the game."""

    def __init__(self, name: str, player_id: Optional[str] = None):
        """Initialize a player with a name and unique ID.
        
        Args:
            name: The player's name (must be non-empty string)
            player_id: Optional pre-assigned ID; generates UUID if not provided
            
        Raises:
            ValueError: If name is empty or not a string
        """
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Player name must be a non-empty string")
        
        self.name = name.strip()
        self.player_id = player_id or str(uuid.uuid4())

    def __repr__(self) -> str:
        """Return string representation of player."""
        return f"Player(name='{self.name}', id='{self.player_id}')"

    def __eq__(self, other) -> bool:
        """Compare players by ID."""
        if not isinstance(other, Player):
            return False
        return self.player_id == other.player_id


class PlayerManager:
    """Manages player collection and validation for the game."""

    MIN_PLAYERS = 2
    MAX_PLAYERS = 8

    def __init__(self):
        """Initialize empty player list."""
        self._players: List[Player] = []

    def add_player(self, name: str) -> Player:
        """Add a player to the game.
        
        Args:
            name: The player's name
            
        Returns:
            The created Player object
            
        Raises:
            ValueError: If name is invalid or max players reached
        """
        if not isinstance(name, str) or not name.strip():
            raise ValueError("Player name must be a non-empty string")
        
        if len(self._players) >= self.MAX_PLAYERS:
            raise ValueError(
                f"Cannot add more than {self.MAX_PLAYERS} players"
            )
        
        # Check for duplicate names
        if any(p.name.lower() == name.strip().lower() for p in self._players):
            raise ValueError(f"Player with name '{name.strip()}' already exists")
        
        player = Player(name)
        self._players.append(player)
        return player

    def get_players(self) -> List[Player]:
        """Get all players currently in the game.
        
        Returns:
            List of Player objects in order they were added
        """
        return self._players.copy()

    def get_player_count(self) -> int:
        """Get the number of players currently in the game.
        
        Returns:
            Number of players
        """
        return len(self._players)

    def get_player_names(self) -> List[str]:
        """Get all player names.
        
        Returns:
            List of player names in order
        """
        return [p.name for p in self._players]

    def get_player_by_id(self, player_id: str) -> Optional[Player]:
        """Get a player by their unique ID.
        
        Args:
            player_id: The unique player ID
            
        Returns:
            Player object if found, None otherwise
        """
        for player in self._players:
            if player.player_id == player_id:
                return player
        return None

    def can_start_game(self) -> bool:
        """Check if game can be started.
        
        Game requires at least 2 players to start.
        
        Returns:
            True if player count is in valid range, False otherwise
        """
        return self.MIN_PLAYERS <= len(self._players) <= self.MAX_PLAYERS

    def clear_players(self) -> None:
        """Clear all players from the game.
        
        Used to reset game state.
        """
        self._players.clear()
