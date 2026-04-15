"""Unit tests for player management.

Tests all acceptance criteria for player setup.
"""

import pytest
from player_manager import Player, PlayerManager


class TestPlayer:
    """Tests for the Player class."""

    def test_player_creation_with_name(self):
        """Test creating a player with a name."""
        player = Player("Alice")
        assert player.name == "Alice"
        assert player.player_id is not None

    def test_player_gets_unique_id(self):
        """Test that each player gets a unique ID."""
        player1 = Player("Alice")
        player2 = Player("Bob")
        assert player1.player_id != player2.player_id

    def test_player_name_trimmed(self):
        """Test that player names are trimmed."""
        player = Player("  Alice  ")
        assert player.name == "Alice"

    def test_player_rejects_empty_name(self):
        """Test that empty names are rejected."""
        with pytest.raises(ValueError, match="non-empty string"):
            Player("")

    def test_player_rejects_whitespace_only_name(self):
        """Test that whitespace-only names are rejected."""
        with pytest.raises(ValueError, match="non-empty string"):
            Player("   ")

    def test_player_rejects_non_string_name(self):
        """Test that non-string names are rejected."""
        with pytest.raises(ValueError, match="non-empty string"):
            Player(123)

    def test_player_with_custom_id(self):
        """Test creating a player with a custom ID."""
        custom_id = "custom-123"
        player = Player("Alice", player_id=custom_id)
        assert player.player_id == custom_id

    def test_player_equality(self):
        """Test that players are equal based on ID."""
        player1 = Player("Alice", player_id="id-1")
        player2 = Player("Alice", player_id="id-1")
        assert player1 == player2

    def test_player_inequality(self):
        """Test that players with different IDs are not equal."""
        player1 = Player("Alice", player_id="id-1")
        player2 = Player("Bob", player_id="id-2")
        assert player1 != player2


class TestPlayerManager:
    """Tests for the PlayerManager class."""

    def test_add_single_player(self):
        """Test adding one player at a time (AC1)."""
        manager = PlayerManager()
        player = manager.add_player("Alice")
        
        assert player.name == "Alice"
        assert player.player_id is not None
        assert manager.get_player_count() == 1

    def test_add_multiple_players_sequentially(self):
        """Test adding multiple players one at a time (AC1)."""
        manager = PlayerManager()
        
        player1 = manager.add_player("Alice")
        player2 = manager.add_player("Bob")
        player3 = manager.add_player("Charlie")
        
        assert manager.get_player_count() == 3
        assert manager.get_player_names() == ["Alice", "Bob", "Charlie"]
        assert player1.player_id != player2.player_id != player3.player_id

    def test_minimum_players_enforcement_one_player(self):
        """Test that game cannot start with only 1 player (AC3)."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        assert manager.get_player_count() == 1
        assert not manager.can_start_game()

    def test_minimum_players_enforcement_zero_players(self):
        """Test that game cannot start with no players (AC3)."""
        manager = PlayerManager()
        
        assert manager.get_player_count() == 0
        assert not manager.can_start_game()

    def test_minimum_players_enforcement_two_players(self):
        """Test that game can start with 2 players (AC3)."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        
        assert manager.get_player_count() == 2
        assert manager.can_start_game()

    def test_maximum_players_limit(self):
        """Test that adding more than 8 players is rejected (AC2)."""
        manager = PlayerManager()
        
        # Add 8 players successfully
        for i in range(8):
            manager.add_player(f"Player{i+1}")
        
        assert manager.get_player_count() == 8
        assert manager.can_start_game()
        
        # Try to add 9th player
        with pytest.raises(ValueError, match="Cannot add more than 8 players"):
            manager.add_player("Player9")

    def test_minimum_players_limit(self):
        """Test that 2 is the minimum (AC2 and AC3)."""
        manager = PlayerManager()
        
        manager.add_player("Alice")
        assert not manager.can_start_game()
        
        manager.add_player("Bob")
        assert manager.can_start_game()

    def test_all_player_counts_in_range(self):
        """Test that all counts 2-8 are valid (AC2)."""
        for count in range(2, 9):
            manager = PlayerManager()
            for i in range(count):
                manager.add_player(f"Player{i+1}")
            assert manager.can_start_game()

    def test_duplicate_player_names_rejected(self):
        """Test that duplicate player names are rejected."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("Alice")

    def test_duplicate_player_names_case_insensitive(self):
        """Test that duplicate detection is case-insensitive."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        with pytest.raises(ValueError, match="already exists"):
            manager.add_player("ALICE")

    def test_get_players(self):
        """Test retrieving player list."""
        manager = PlayerManager()
        p1 = manager.add_player("Alice")
        p2 = manager.add_player("Bob")
        
        players = manager.get_players()
        assert len(players) == 2
        assert players[0] == p1
        assert players[1] == p2

    def test_get_player_names(self):
        """Test retrieving player names for display (AC4)."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        manager.add_player("Charlie")
        
        names = manager.get_player_names()
        assert names == ["Alice", "Bob", "Charlie"]

    def test_get_player_by_id(self):
        """Test retrieving a player by their unique ID."""
        manager = PlayerManager()
        player = manager.add_player("Alice")
        
        found = manager.get_player_by_id(player.player_id)
        assert found == player
        assert found.name == "Alice"

    def test_get_player_by_id_not_found(self):
        """Test that invalid ID returns None."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        found = manager.get_player_by_id("invalid-id")
        assert found is None

    def test_players_list_is_copy(self):
        """Test that returned player list is a copy."""
        manager = PlayerManager()
        manager.add_player("Alice")
        
        players1 = manager.get_players()
        players1.clear()
        
        players2 = manager.get_players()
        assert len(players2) == 1

    def test_clear_players(self):
        """Test clearing all players."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.add_player("Bob")
        
        assert manager.get_player_count() == 2
        
        manager.clear_players()
        assert manager.get_player_count() == 0

    def test_add_player_after_clear(self):
        """Test that players can be added after clearing."""
        manager = PlayerManager()
        manager.add_player("Alice")
        manager.clear_players()
        
        new_player = manager.add_player("Bob")
        assert new_player.name == "Bob"
        assert manager.get_player_count() == 1
