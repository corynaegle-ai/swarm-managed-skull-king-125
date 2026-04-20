import React, { useState, useMemo } from 'react';
import './RoundScoring.css';

interface RoundScoringProps {
  playerNames: string[];
  playerBids: number[];
  handsInRound: number;
  onSubmit: (tricksPerPlayer: number[], bonusPerPlayer: number[]) => void;
}

export const RoundScoring: React.FC<RoundScoringProps> = ({
  playerNames,
  playerBids,
  handsInRound,
  onSubmit,
}) => {
  const [tricksPerPlayer, setTricksPerPlayer] = useState<number[]>(
    Array(playerNames.length).fill(0)
  );
  const [bonusPerPlayer, setBonusPerPlayer] = useState<number[]>(
    Array(playerNames.length).fill(0)
  );
  const [errors, setErrors] = useState<string[]>([]);

  const handleTricksChange = (playerIndex: number, tricks: number) => {
    if (tricks < 0 || tricks > handsInRound) return;
    const newTricks = [...tricksPerPlayer];
    newTricks[playerIndex] = tricks;
    setTricksPerPlayer(newTricks);
  };

  const handleBonusChange = (playerIndex: number, bonus: number) => {
    if (bonus < 0) return;
    const newBonus = [...bonusPerPlayer];
    newBonus[playerIndex] = bonus;
    setBonusPerPlayer(newBonus);
  };

  const isBidCorrect = useMemo(() => {
    return playerNames.map(
      (_, i) => tricksPerPlayer[i] === playerBids[i]
    );
  }, [tricksPerPlayer, playerBids, playerNames]);

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Check that bonus points are only given when bid is correct
    playerNames.forEach((name, i) => {
      if (bonusPerPlayer[i] > 0 && !isBidCorrect[i]) {
        newErrors.push(
          `${name} cannot receive bonus points (bid was ${playerBids[i]}, got ${tricksPerPlayer[i]} tricks)`
        );
      }
    });

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(tricksPerPlayer, bonusPerPlayer);
    }
  };

  return (
    <div className="round-scoring">
      <h2>Round Scoring</h2>
      <table className="scoring-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Bid</th>
            <th>Tricks Taken</th>
            <th>Bonus Points</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {playerNames.map((name, i) => (
            <tr key={i} className={isBidCorrect[i] ? 'bid-correct' : 'bid-incorrect'}>
              <td>{name}</td>
              <td>{playerBids[i]}</td>
              <td>
                <input
                  type="number"
                  min="0"
                  max={handsInRound}"
                  value={tricksPerPlayer[i]}
                  onChange={(e) => handleTricksChange(i, parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </td>
              <td>
                <input
                  type="number"
                  min="0"
                  value={bonusPerPlayer[i]}
                  onChange={(e) => handleBonusChange(i, parseInt(e.target.value) || 0)}
                  disabled={!isBidCorrect[i]}
                  className="input-field"
                />
              </td>
              <td>{isBidCorrect[i] ? '✓ Made Bid' : '✗ Missed Bid'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <div key={i} className="error-message">
              {error}
            </div>
          ))}
        </div>
      )}

      <button onClick={handleSubmit} className="submit-button">
        Submit Round
      </button>
    </div>
  );
};
