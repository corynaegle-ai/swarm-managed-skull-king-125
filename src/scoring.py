"""Score calculation engine for Skull King card game.

Implements scoring rules:
- Correct bid: +20 points per trick taken
- Incorrect bid: -10 points per point of difference
- Zero bid with zero tricks: +10 × round number
- Zero bid with non-zero tricks: -10 × round number
- Bonus points: only added if bid is correct
"""


class ScoreCalculationError(Exception):
    """Raised when score calculation parameters are invalid."""
    pass


def calculate_score(bid: int, tricks_taken: int, round_number: int, bonus_points: int = 0) -> int:
    """Calculate score based on Skull King rules.

    Args:
        bid: Number of tricks bid (0 to 14)
        tricks_taken: Number of tricks actually taken (0 to 14)
        round_number: Current round number (1 to 14)
        bonus_points: Additional bonus points (only added if bid is correct)

    Returns:
        Total score as integer

    Raises:
        ScoreCalculationError: If parameters are invalid

    Rules:
        1. If bid == tricks_taken and bid > 0: score = 20 * tricks_taken + bonus_points
        2. If bid == 0 and tricks_taken == 0: score = 10 * round_number
        3. If bid != tricks_taken: score = -10 * abs(bid - tricks_taken)
        4. If bid == 0 and tricks_taken > 0: score = -10 * round_number
    """
    # Input validation
    if not isinstance(bid, int) or not isinstance(tricks_taken, int):
        raise ScoreCalculationError("Bid and tricks_taken must be integers")
    if not isinstance(round_number, int):
        raise ScoreCalculationError("Round number must be an integer")
    if not isinstance(bonus_points, int):
        raise ScoreCalculationError("Bonus points must be an integer")

    if bid < 0 or bid > 14:
        raise ScoreCalculationError(f"Bid must be between 0 and 14, got {bid}")
    if tricks_taken < 0 or tricks_taken > 14:
        raise ScoreCalculationError(f"Tricks taken must be between 0 and 14, got {tricks_taken}")
    if round_number < 1 or round_number > 14:
        raise ScoreCalculationError(f"Round number must be between 1 and 14, got {round_number}")
    if bonus_points < 0:
        raise ScoreCalculationError(f"Bonus points cannot be negative, got {bonus_points}")

    # Handle zero bid special cases
    if bid == 0:
        if tricks_taken == 0:
            # Zero bid with zero tricks: +10 × round number
            return 10 * round_number
        else:
            # Zero bid with non-zero tricks: -10 × round number
            return -10 * round_number

    # Handle normal bids (non-zero)
    if bid == tricks_taken:
        # Correct bid: +20 per trick + bonus points only if correct
        return 20 * tricks_taken + bonus_points
    else:
        # Incorrect bid: -10 per point of difference
        return -10 * abs(bid - tricks_taken)
