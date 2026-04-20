import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundScoring } from './RoundScoring';

describe('RoundScoring Component', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    playerNames: ['Alice', 'Bob', 'Charlie'],
    playerBids: [2, 3, 1],
    handsInRound: 5,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  test('renders player names and bids', () => {
    render(<RoundScoring {...defaultProps} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('Charlie')).toBeInTheDocument();
  });

  test('shows each player\'s bid for reference', () => {
    render(<RoundScoring {...defaultProps} />);

    const bidCells = screen.getAllByRole('cell');
    expect(bidCells).toContainEqual(expect.objectContaining({ textContent: '2' }));
    expect(bidCells).toContainEqual(expect.objectContaining({ textContent: '3' }));
    expect(bidCells).toContainEqual(expect.objectContaining({ textContent: '1' }));
  });

  test('collects tricks taken (0 to handsInRound)', () => {
    render(<RoundScoring {...defaultProps} />);

    const tricksInputs = screen.getAllByRole('spinbutton').slice(0, 3);

    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    expect(tricksInputs[0]).toHaveValue(2);

    fireEvent.change(tricksInputs[0], { target: { value: '5' } });
    expect(tricksInputs[0]).toHaveValue(5);
  });

  test('prevents tricks outside valid range', () => {
    render(<RoundScoring {...defaultProps} />);

    const tricksInputs = screen.getAllByRole('spinbutton').slice(0, 3);

    // Try to set an invalid value
    fireEvent.change(tricksInputs[0], { target: { value: '6' } });
    // Value should not change (component prevents it)
    expect(tricksInputs[0]).not.toHaveValue(6);
  });

  test('collects bonus points for each player', () => {
    render(<RoundScoring {...defaultProps} />);

    const bonusInputs = screen.getAllByRole('spinbutton').slice(3, 6);

    fireEvent.change(bonusInputs[0], { target: { value: '10' } });
    expect(bonusInputs[0]).toHaveValue(10);
  });

  test('only allows bonus points if bid was correct', () => {
    render(<RoundScoring {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const tricksInputs = inputs.slice(0, 3);
    const bonusInputs = inputs.slice(3, 6);

    // Set tricks to not match bid
    fireEvent.change(tricksInputs[0], { target: { value: '1' } });

    // Try to add bonus - should be disabled
    expect(bonusInputs[0]).toBeDisabled();

    // Set tricks to match bid
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });

    // Now bonus should be enabled
    expect(bonusInputs[0]).not.toBeDisabled();
  });

  test('shows bid status correctly', () => {
    render(<RoundScoring {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const tricksInputs = inputs.slice(0, 3);

    // Set matching bid
    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    expect(screen.getByText('✓ Made Bid')).toBeInTheDocument();

    // Set non-matching bid
    fireEvent.change(tricksInputs[0], { target: { value: '1' } });
    expect(screen.getByText('✗ Missed Bid')).toBeInTheDocument();
  });

  test('validates that bonus points only given for correct bids', () => {
    render(<RoundScoring {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const tricksInputs = inputs.slice(0, 3);
    const bonusInputs = inputs.slice(3, 6);

    // Set incorrect bid
    fireEvent.change(tricksInputs[0], { target: { value: '1' } });

    // Try to submit with bonus points
    fireEvent.change(bonusInputs[0], { target: { value: '10' } });
    fireEvent.click(screen.getByText('Submit Round'));

    // Should show error and not call onSubmit
    expect(screen.getByText(/cannot receive bonus points/)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  test('calls onSubmit with correct data when valid', () => {
    render(<RoundScoring {...defaultProps} />);

    const inputs = screen.getAllByRole('spinbutton');
    const tricksInputs = inputs.slice(0, 3);
    const bonusInputs = inputs.slice(3, 6);

    fireEvent.change(tricksInputs[0], { target: { value: '2' } });
    fireEvent.change(tricksInputs[1], { target: { value: '3' } });
    fireEvent.change(tricksInputs[2], { target: { value: '1' } });

    fireEvent.change(bonusInputs[0], { target: { value: '5' } });
    fireEvent.change(bonusInputs[1], { target: { value: '10' } });
    fireEvent.change(bonusInputs[2], { target: { value: '0' } });

    fireEvent.click(screen.getByText('Submit Round'));

    expect(mockOnSubmit).toHaveBeenCalledWith([2, 3, 1], [5, 10, 0]);
  });
});
