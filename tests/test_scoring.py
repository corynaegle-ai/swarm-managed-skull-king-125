"""Tests for the score calculation engine."""

import pytest
from src.scoring import calculate_score, ScoreCalculationError


class TestBasicScoring:
    """Test basic scoring scenarios."""

    def test_bid_3_take_3_round_any(self):
        """Acceptance Criterion 1: Bid 3, take 3 = 60 points (20×3)."""
        assert calculate_score(bid=3, tricks_taken=3, round_number=1) == 60
        assert calculate_score(bid=3, tricks_taken=3, round_number=7) == 60

    def test_bid_2_take_4(self):
        """Acceptance Criterion 2: Bid 2, take 4 = -20 points (-10×2 difference)."""
        # Difference is |2 - 4| = 2, so score = -10 * 2 = -20
        assert calculate_score(bid=2, tricks_taken=4, round_number=1) == -20

    def test_zero_bid_zero_tricks_round_7(self):
        """Acceptance Criterion 3: Bid 0, take 0 in round 7 = +70 points (10×7)."""
        assert calculate_score(bid=0, tricks_taken=0, round_number=7) == 70

    def test_zero_bid_nonzero_tricks_round_9(self):
        """Acceptance Criterion 4: Bid 0, take 2 in round 9 = -90 points (-10×9)."""
        assert calculate_score(bid=0, tricks_taken=2, round_number=9) == -90

    def test_bonus_points_only_if_correct(self):
        """Acceptance Criterion 5: Bonus points only added if bid was correct."""
        # Correct bid: bonus points added
        assert calculate_score(bid=5, tricks_taken=5, round_number=1, bonus_points=30) == 100 + 30
        # Incorrect bid: bonus points NOT added
        assert calculate_score(bid=5, tricks_taken=3, round_number=1, bonus_points=30) == -20


class TestZeroBidVariations:
    """Test various zero bid scenarios."""

    def test_zero_bid_zero_tricks_various_rounds(self):
        """Zero bid with zero tricks should give +10 × round number."""
        assert calculate_score(bid=0, tricks_taken=0, round_number=1) == 10
        assert calculate_score(bid=0, tricks_taken=0, round_number=5) == 50
        assert calculate_score(bid=0, tricks_taken=0, round_number=14) == 140

    def test_zero_bid_nonzero_tricks_various_rounds(self):
        """Zero bid with non-zero tricks should give -10 × round number."""
        assert calculate_score(bid=0, tricks_taken=1, round_number=1) == -10
        assert calculate_score(bid=0, tricks_taken=5, round_number=5) == -50
        assert calculate_score(bid=0, tricks_taken=14, round_number=14) == -140


class TestCorrectBids:
    """Test correct bid scenarios."""

    def test_correct_bid_1(self):
        """Bid 1, take 1 = 20 points."""
        assert calculate_score(bid=1, tricks_taken=1, round_number=1) == 20

    def test_correct_bid_14(self):
        """Bid 14, take 14 = 280 points (20×14)."""
        assert calculate_score(bid=14, tricks_taken=14, round_number=14) == 280

    def test_correct_bid_with_bonus(self):
        """Correct bid includes bonus points."""
        assert calculate_score(bid=3, tricks_taken=3, round_number=1, bonus_points=50) == 110
        assert calculate_score(bid=10, tricks_taken=10, round_number=10, bonus_points=100) == 300


class TestIncorrectBids:
    """Test incorrect bid scenarios."""

    def test_bid_too_high(self):
        """Bid higher than tricks taken."""
        assert calculate_score(bid=5, tricks_taken=2, round_number=1) == -30
        assert calculate_score(bid=10, tricks_taken=3, round_number=5) == -70

    def test_bid_too_low(self):
        """Bid lower than tricks taken."""
        assert calculate_score(bid=2, tricks_taken=5, round_number=1) == -30
        assert calculate_score(bid=3, tricks_taken=10, round_number=8) == -70

    def test_incorrect_bid_ignores_bonus(self):
        """Bonus points not applied for incorrect bids."""
        assert calculate_score(bid=5, tricks_taken=2, round_number=1, bonus_points=50) == -30
        assert calculate_score(bid=3, tricks_taken=7, round_number=5, bonus_points=100) == -40


class TestInputValidation:
    """Test input validation and error handling."""

    def test_invalid_bid_negative(self):
        """Bid cannot be negative."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=-1, tricks_taken=0, round_number=1)

    def test_invalid_bid_too_high(self):
        """Bid cannot exceed 14."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=15, tricks_taken=10, round_number=1)

    def test_invalid_tricks_negative(self):
        """Tricks taken cannot be negative."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=-1, round_number=1)

    def test_invalid_tricks_too_high(self):
        """Tricks taken cannot exceed 14."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=15, round_number=1)

    def test_invalid_round_zero(self):
        """Round number must be at least 1."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=5, round_number=0)

    def test_invalid_round_too_high(self):
        """Round number cannot exceed 14."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=5, round_number=15)

    def test_invalid_bonus_negative(self):
        """Bonus points cannot be negative."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=5, round_number=1, bonus_points=-10)

    def test_invalid_bid_type(self):
        """Bid must be an integer."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid="5", tricks_taken=5, round_number=1)

    def test_invalid_tricks_type(self):
        """Tricks taken must be an integer."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken="5", round_number=1)

    def test_invalid_round_type(self):
        """Round number must be an integer."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=5, round_number="1")

    def test_invalid_bonus_type(self):
        """Bonus points must be an integer."""
        with pytest.raises(ScoreCalculationError):
            calculate_score(bid=5, tricks_taken=5, round_number=1, bonus_points="10")


class TestEdgeCases:
    """Test edge cases and boundary conditions."""

    def test_all_zeros_except_round(self):
        """Bid 0, tricks 0 is valid special case."""
        assert calculate_score(bid=0, tricks_taken=0, round_number=1) == 10

    def test_boundary_bid_1(self):
        """Minimum non-zero bid."""
        assert calculate_score(bid=1, tricks_taken=1, round_number=1) == 20

    def test_boundary_bid_14(self):
        """Maximum bid."""
        assert calculate_score(bid=14, tricks_taken=14, round_number=1) == 280

    def test_boundary_round_1(self):
        """Minimum round number."""
        assert calculate_score(bid=0, tricks_taken=0, round_number=1) == 10

    def test_boundary_round_14(self):
        """Maximum round number."""
        assert calculate_score(bid=0, tricks_taken=0, round_number=14) == 140

    def test_difference_of_1(self):
        """Smallest possible difference for incorrect bid."""
        assert calculate_score(bid=5, tricks_taken=4, round_number=1) == -10

    def test_difference_of_14(self):
        """Largest possible difference for incorrect bid."""
        assert calculate_score(bid=0, tricks_taken=14, round_number=1) == -140
