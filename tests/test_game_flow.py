import pytest
from skull_king.game_flow import (
    GamePhase,
    GameState,
    GameFlowManager,
    PlayerScore,
)


class TestGamePhase:
    """Tests for GamePhase enumeration."""

    def test_game_phases_exist(self):
        """Test that all required game phases exist."""
        assert GamePhase.SETUP.value == "setup"
        assert GamePhase.BIDDING.value == "bidding"
        assert GamePhase.SCORING.value == "scoring"
        assert GamePhase.GAME_COMPLETE.value == "game_complete"


class TestGameState:
    """Tests for GameState class."""

    def test_initial_state(self):
        """Test that game starts in correct state."""
        state = GameState()
        assert state.current_round == 1
        assert state.current_phase == GamePhase.SETUP
        assert state.game_complete is False
        assert state.winner is None
        assert len(state.player_scores) == 0

    def test_add_player(self):
        """Test adding players to the game state."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.add_player("p2", "Bob")

        assert len(state.player_scores) == 2
        assert state.player_scores[0].player_name == "Alice"
        assert state.player_scores[1].player_name == "Bob"

    def test_add_duplicate_player(self):
        """Test that duplicate players are not added."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.add_player("p1", "Alice")

        assert len(state.player_scores) == 1

    def test_phase_progression(self):
        """Test progression through game phases."""
        state = GameState()
        assert state.current_phase == GamePhase.SETUP

        state.advance_phase()
        assert state.current_phase == GamePhase.BIDDING

        state.advance_phase()
        assert state.current_phase == GamePhase.SCORING

    def test_round_advancement_after_scoring(self):
        """Test that round advances after scoring phase."""
        state = GameState()
        state.advance_phase()  # SETUP -> BIDDING
        state.advance_phase()  # BIDDING -> SCORING
        state.advance_phase()  # SCORING -> next round's SETUP

        assert state.current_round == 2
        assert state.current_phase == GamePhase.SETUP

    def test_game_completion_after_round_10(self):
        """Test that game completes after round 10."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.add_player("p2", "Bob")

        # Simulate 10 rounds
        for round_num in range(1, 11):
            assert state.current_round == round_num
            assert not state.game_complete

            state.advance_phase()  # SETUP -> BIDDING
            state.advance_phase()  # BIDDING -> SCORING
            state.advance_phase()  # SCORING -> next round or GAME_COMPLETE

        assert state.game_complete is True
        assert state.current_phase == GamePhase.GAME_COMPLETE
        assert state.winner is not None

    def test_determine_winner(self):
        """Test that winner is correctly determined."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.add_player("p2", "Bob")
        state.add_player("p3", "Charlie")

        state.player_scores[0].total_score = 100
        state.player_scores[1].total_score = 150  # Highest
        state.player_scores[2].total_score = 120

        state._determine_winner()
        assert state.winner == "Bob"

    def test_get_final_scores_sorted(self):
        """Test that final scores are returned sorted."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.add_player("p2", "Bob")
        state.add_player("p3", "Charlie")

        state.player_scores[0].total_score = 100
        state.player_scores[1].total_score = 150
        state.player_scores[2].total_score = 120

        scores = state.get_final_scores()
        assert scores[0] == ("Bob", 150)
        assert scores[1] == ("Charlie", 120)
        assert scores[2] == ("Alice", 100)

    def test_get_current_status(self):
        """Test getting current game status."""
        state = GameState()
        state.add_player("p1", "Alice")
        state.current_round = 5
        state.current_phase = GamePhase.BIDDING

        status = state.get_current_status()
        assert status["round"] == 5
        assert status["phase"] == "bidding"
        assert status["is_complete"] is False
        assert "scores" in status


class TestPlayerScore:
    """Tests for PlayerScore class."""

    def test_player_score_creation(self):
        """Test creating a player score."""
        score = PlayerScore("p1", "Alice")
        assert score.player_id == "p1"
        assert score.player_name == "Alice"
        assert score.total_score == 0
        assert len(score.round_scores) == 0

    def test_add_round_score(self):
        """Test adding round scores."""
        score = PlayerScore("p1", "Alice")
        score.add_round_score(10)
        score.add_round_score(15)
        score.add_round_score(5)

        assert score.total_score == 30
        assert score.round_scores == [10, 15, 5]


class TestGameFlowManager:
    """Tests for GameFlowManager class."""

    def setup_method(self):
        """Set up test fixtures."""
        self.manager = GameFlowManager()
        self.players = [("p1", "Alice"), ("p2", "Bob"), ("p3", "Charlie")]

    def test_initialize_game(self):
        """Test initializing the game with players."""
        self.manager.initialize_game(self.players)
        status = self.manager.get_game_status()
        assert len(status["scores"]) == 3

    def test_progress_through_phases(self):
        """Test progressing through game phases."""
        self.manager.initialize_game(self.players)

        status = self.manager.get_game_status()
        assert status["phase"] == "setup"

        self.manager.progress_phase()
        status = self.manager.get_game_status()
        assert status["phase"] == "bidding"

        self.manager.progress_phase()
        status = self.manager.get_game_status()
        assert status["phase"] == "scoring"

    def test_update_round_scores(self):
        """Test updating round scores."""
        self.manager.initialize_game(self.players)
        self.manager.progress_phase()  # SETUP -> BIDDING
        self.manager.progress_phase()  # BIDDING -> SCORING

        scores = {"p1": 20, "p2": 15, "p3": 25}
        self.manager.update_round_scores(scores)

        status = self.manager.get_game_status()
        assert status["scores"][0][1] == 25  # Charlie highest
        assert status["scores"][1][1] == 20  # Alice
        assert status["scores"][2][1] == 15  # Bob

    def test_cannot_score_outside_scoring_phase(self):
        """Test that scores can only be updated during scoring phase."""
        self.manager.initialize_game(self.players)
        scores = {"p1": 20, "p2": 15, "p3": 25}

        with pytest.raises(ValueError):
            self.manager.update_round_scores(scores)

    def test_game_completes_after_10_rounds(self):
        """Test that game completes after 10 rounds."""
        self.manager.initialize_game(self.players)

        # Simulate 10 complete rounds
        for round_num in range(1, 11):
            assert not self.manager.is_game_complete()
            assert self.manager.get_game_status()["round"] == round_num

            self.manager.progress_phase()  # SETUP -> BIDDING
            self.manager.progress_phase()  # BIDDING -> SCORING

            scores = {"p1": 10 + round_num, "p2": 15 + round_num, "p3": 20 + round_num}
            self.manager.update_round_scores(scores)

            self.manager.progress_phase()  # SCORING -> next round SETUP or GAME_COMPLETE

        assert self.manager.is_game_complete()
        status = self.manager.get_game_status()
        assert status["phase"] == "game_complete"

    def test_get_final_scores_and_winner(self):
        """Test getting final scores and winner when game is complete."""
        self.manager.initialize_game(self.players)

        # Simulate 10 complete rounds with increasing scores
        for round_num in range(1, 11):
            self.manager.progress_phase()  # SETUP -> BIDDING
            self.manager.progress_phase()  # BIDDING -> SCORING

            # Charlie consistently scores highest
            scores = {"p1": 10, "p2": 15, "p3": 25}
            self.manager.update_round_scores(scores)

            self.manager.progress_phase()  # SCORING -> next round SETUP or GAME_COMPLETE

        assert self.manager.is_game_complete()
        winner = self.manager.get_winner()
        assert winner == "Charlie"

        final_scores = self.manager.get_final_scores()
        assert final_scores[0][0] == "Charlie"
        assert final_scores[0][1] == 250  # 25 * 10 rounds

    def test_cannot_progress_after_game_complete(self):
        """Test that cannot progress phase after game is complete."""
        self.manager.initialize_game(self.players)

        # Simulate 10 complete rounds
        for round_num in range(1, 11):
            self.manager.progress_phase()  # SETUP -> BIDDING
            self.manager.progress_phase()  # BIDDING -> SCORING
            scores = {"p1": 10, "p2": 15, "p3": 25}
            self.manager.update_round_scores(scores)
            self.manager.progress_phase()  # SCORING -> next round SETUP or GAME_COMPLETE

        with pytest.raises(RuntimeError):
            self.manager.progress_phase()

    def test_cannot_get_final_scores_before_completion(self):
        """Test that final scores cannot be accessed before game completion."""
        self.manager.initialize_game(self.players)

        with pytest.raises(RuntimeError):
            self.manager.get_final_scores()

    def test_cannot_get_winner_before_completion(self):
        """Test that winner cannot be accessed before game completion."""
        self.manager.initialize_game(self.players)

        with pytest.raises(RuntimeError):
            self.manager.get_winner()

    def test_game_status_display(self):
        """Test that game status can be displayed at any point."""
        self.manager.initialize_game(self.players)

        status = self.manager.get_game_status()
        assert "round" in status
        assert "phase" in status
        assert "is_complete" in status
        assert "winner" in status
        assert "scores" in status
