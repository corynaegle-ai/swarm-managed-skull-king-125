"""Unit tests for the Game class.

Tests game state management and integration with player setup.
"""

import pytest
from game import Game, GameState


class TestGameSetup:
    """Tests for game setup phase."""

    def test_game_starts_in_setup_state(self):
        """Test that a new game starts in SETUP state."""
        game = Game()
        assert game.state == GameState.SETUP

    def test_add_player_to_game(self):
        """Test adding a player to the game (AC1)."""
        game = Game()
        player = game.add_player("Alice")
        
        assert player.name == "Alice"
        assert player.player_id is not None
        assert game.get_player_count() == 1

    def test_add_multiple_players_to_game(self):
        """Test adding multiple players one at a time (AC1)."""
        game = Game()
        
        p1 = game.add_player("Alice")
        p2 = game.add_player("Bob")
        p3 = game.add_player("Charlie")
        
        assert game.get_player_count() == 3
        assert game.get_player_names() == ["Alice", "Bob", "Charlie"]

    def test_cannot_add_more_than_8_players(self):
        """Test that adding more than 8 players is rejected (AC2)."""
        game = Game()
        
        for i in range(8):
            game.add_player(f"Player{i+1}")
        
        with pytest.raises(ValueError, match="Cannot add more than 8 players"):
            game.add_player("Player9")

    def test_cannot_add_player_outside_setup(self):
        """Test that players cannot be added after game starts."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        game.start_game()
        
        with pytest.raises(ValueError, match="Can only add players during game setup"):
            game.add_player("Charlie")


class TestGameStartConditions:
    """Tests for game start validation."""

    def test_cannot_start_with_no_players(self):
        """Test that game cannot start with 0 players (AC3)."""
        game = Game()
        
        assert not game.can_start_game()
        
        with pytest.raises(ValueError, match="Cannot start game"):
            game.start_game()

    def test_cannot_start_with_one_player(self):
        """Test that game cannot start with only 1 player (AC3)."""
        game = Game()
        game.add_player("Alice")
        
        assert not game.can_start_game()
        
        with pytest.raises(ValueError, match="Cannot start game with 1 players"):
            game.start_game()

    def test_can_start_with_two_players(self):
        """Test that game can start with 2 players (AC3)."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        assert game.can_start_game()
        game.start_game()
        assert game.state == GameState.IN_PROGRESS

    def test_can_start_with_max_players(self):
        """Test that game can start with 8 players (AC2)."""
        game = Game()
        
        for i in range(8):
            game.add_player(f"Player{i+1}")
        
        assert game.can_start_game()
        game.start_game()
        assert game.state == GameState.IN_PROGRESS

    def test_can_start_with_valid_player_counts(self):
        """Test that game can start with any valid player count 2-8 (AC2)."""
        for count in range(2, 9):
            game = Game()
            
            for i in range(count):
                game.add_player(f"Player{i+1}")
            
            assert game.can_start_game()
            game.start_game()
            assert game.state == GameState.IN_PROGRESS


class TestPlayerNamesDisplay:
    """Tests for player names being displayed throughout the game (AC4)."""

    def test_player_names_available_during_setup(self):
        """Test that player names can be retrieved during setup (AC4)."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        names = game.get_player_names()
        assert names == ["Alice", "Bob"]

    def test_player_names_available_after_game_start(self):
        """Test that player names are accessible after game starts (AC4)."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        game.add_player("Charlie")
        
        game.start_game()
        
        names = game.get_player_names()
        assert names == ["Alice", "Bob", "Charlie"]
        assert game.state == GameState.IN_PROGRESS

    def test_player_names_maintain_order(self):
        """Test that player names maintain insertion order (AC4)."""
        game = Game()
        expected_order = ["Zoe", "Alice", "Michael", "Bob"]
        
        for name in expected_order:
            game.add_player(name)
        
        assert game.get_player_names() == expected_order

    def test_player_names_with_special_characters(self):
        """Test that player names with special characters are preserved (AC4)."""
        game = Game()
        special_names = ["Alice-Smith", "Bob O'Brien", "Charlie_23"]
        
        for name in special_names:
            game.add_player(name)
        
        assert game.get_player_names() == special_names

    def test_get_players_returns_all_data(self):
        """Test that full player data is available (AC4)."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        players = game.get_players()
        assert len(players) == 2
        assert players[0].name == "Alice"
        assert players[0].player_id is not None
        assert players[1].name == "Bob"
        assert players[1].player_id is not None


class TestGameStateTransitions:
    """Tests for game state transitions."""

    def test_game_transitions_to_in_progress(self):
        """Test game state transition from SETUP to IN_PROGRESS."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        assert game.state == GameState.SETUP
        game.start_game()
        assert game.state == GameState.IN_PROGRESS

    def test_game_round_counter_starts_at_one(self):
        """Test that game round starts at 1 when game begins."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        
        assert game.current_round == 0
        game.start_game()
        assert game.current_round == 1

    def test_game_can_finish(self):
        """Test that game can be marked as finished."""
        game = Game()
        game.add_player("Alice")
        game.add_player("Bob")
        game.start_game()
        
        game.finish_game()
        assert game.state == GameState.FINISHED
