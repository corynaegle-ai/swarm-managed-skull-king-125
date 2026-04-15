from enum import Enum
from typing import Optional, List
from dataclasses import dataclass, field


class GamePhase(Enum):
    """Enumeration of game phases."""
    SETUP = "setup"
    BIDDING = "bidding"
    SCORING = "scoring"
    GAME_COMPLETE = "game_complete"


@dataclass
class PlayerScore:
    """Represents a player's score information."""
    player_id: str
    player_name: str
    total_score: int = 0
    round_scores: List[int] = field(default_factory=list)

    def add_round_score(self, score: int) -> None:
        """Add a round score to the player's record."""
        self.round_scores.append(score)
        self.total_score += score


@dataclass
class GameState:
    """Manages the current state of the game."""
    current_round: int = 1
    current_phase: GamePhase = GamePhase.SETUP
    player_scores: List[PlayerScore] = field(default_factory=list)
    game_complete: bool = False
    winner: Optional[str] = None

    MAX_ROUNDS = 10

    def advance_phase(self) -> None:
        """Advance to the next phase."""
        phase_order = [
            GamePhase.SETUP,
            GamePhase.BIDDING,
            GamePhase.SCORING,
        ]

        if self.current_phase == GamePhase.SETUP:
            self.current_phase = GamePhase.BIDDING
        elif self.current_phase == GamePhase.BIDDING:
            self.current_phase = GamePhase.SCORING
        elif self.current_phase == GamePhase.SCORING:
            self._advance_round()

    def _advance_round(self) -> None:
        """Advance to the next round or complete the game."""
        if self.current_round >= self.MAX_ROUNDS:
            self._complete_game()
        else:
            self.current_round += 1
            self.current_phase = GamePhase.SETUP

    def _complete_game(self) -> None:
        """Complete the game and determine the winner."""
        self.game_complete = True
        self.current_phase = GamePhase.GAME_COMPLETE
        self._determine_winner()

    def _determine_winner(self) -> None:
        """Determine the winner based on highest score."""
        if not self.player_scores:
            self.winner = None
            return

        winner = max(self.player_scores, key=lambda p: p.total_score)
        self.winner = winner.player_name

    def add_player(self, player_id: str, player_name: str) -> None:
        """Add a player to the game."""
        if not any(p.player_id == player_id for p in self.player_scores):
            self.player_scores.append(PlayerScore(player_id=player_id, player_name=player_name))

    def get_final_scores(self) -> List[tuple]:
        """Get final scores sorted by total score (descending)."""
        return sorted(
            [(p.player_name, p.total_score) for p in self.player_scores],
            key=lambda x: x[1],
            reverse=True
        )

    def get_current_status(self) -> dict:
        """Get the current game status."""
        return {
            "round": self.current_round,
            "phase": self.current_phase.value,
            "is_complete": self.game_complete,
            "winner": self.winner,
            "scores": self.get_final_scores()
        }


class GameFlowManager:
    """Manages the flow of the game, handling phase transitions and round progression."""

    def __init__(self):
        """Initialize the game flow manager."""
        self.state = GameState()

    def initialize_game(self, players: List[tuple]) -> None:
        """
        Initialize the game with players.
        
        Args:
            players: List of (player_id, player_name) tuples
        """
        for player_id, player_name in players:
            self.state.add_player(player_id, player_name)

    def progress_phase(self) -> None:
        """Progress to the next game phase."""
        if self.state.game_complete:
            raise RuntimeError("Cannot progress phase: game is complete")
        self.state.advance_phase()

    def update_round_scores(self, scores: dict) -> None:
        """
        Update scores for the current round.
        
        Args:
            scores: Dictionary mapping player_id to their round score
        """
        if self.state.current_phase != GamePhase.SCORING:
            raise ValueError("Scores can only be updated during scoring phase")

        for player in self.state.player_scores:
            if player.player_id in scores:
                player.add_round_score(scores[player.player_id])

    def get_game_status(self) -> dict:
        """Get the current game status."""
        return self.state.get_current_status()

    def is_game_complete(self) -> bool:
        """Check if the game is complete."""
        return self.state.game_complete

    def get_final_scores(self) -> List[tuple]:
        """Get final scores. Only valid when game is complete."""
        if not self.state.game_complete:
            raise RuntimeError("Game is not complete yet")
        return self.state.get_final_scores()

    def get_winner(self) -> Optional[str]:
        """Get the winner. Only valid when game is complete."""
        if not self.state.game_complete:
            raise RuntimeError("Game is not complete yet")
        return self.state.winner
