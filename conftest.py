"""Pytest configuration file.

Shared fixtures and configuration for all tests.
"""

import pytest
from game import Game
from player_manager import PlayerManager


@pytest.fixture
def player_manager():
    """Fixture providing a fresh PlayerManager for each test."""
    return PlayerManager()


@pytest.fixture
def game():
    """Fixture providing a fresh Game for each test."""
    return Game()


@pytest.fixture
def populated_game():
    """Fixture providing a game with 3 players already added."""
    game = Game()
    game.add_player("Alice")
    game.add_player("Bob")
    game.add_player("Charlie")
    return game
