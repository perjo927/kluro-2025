import { useEffect, useState } from 'react';
import './GameGrid.css';

const cells = Array(6).fill(null).map(() =>
    Array(5).fill(null)
);

const getKluroLetter = (row, col, grid) => {
    return grid[row]?.[col]
}

const GameGrid = (({ onSelectSquare, onErase, gameState = null, currentRow = 0, activeMarker = 0, activeSelection = -1, currentGuess = "" }) => {
    const [revealingIndices, setRevealingIndices] = useState(new Set());

    // Handle reveal animations for completed rows
    useEffect(() => {
        if (!gameState?.grid[currentRow - 1]) return;

        // Mark all letters in the row as pending reveal
        setRevealingIndices(new Set());

        // Reveal each letter with a delay
        Array(5).fill(null).forEach((_, index) => {
            setTimeout(() => {
                setRevealingIndices(prev => {
                    const next = new Set(prev);
                    next.add(index);
                    return next;
                });
            }, index * 200); // 200ms delay between each letter
        });

        // Add bounce animation after all letters have flipped (only if won)
        if (gameState.isWon) {
            setTimeout(() => {
                const row = document.querySelector(`.game-row:nth-child(${currentRow})`);
                row.classList.add('bounce');

                setTimeout(() => {
                    row.classList.remove('bounce');
                }, 500);
            }, 5 * 200 + 100); // Wait for all letters plus a small buffer
        }

    }, [currentRow, gameState]);

    if (!gameState) return null;

    const { grid } = gameState;
    const guess = currentGuess.split("");

    return (
        <div className="gamegrid-container">
            <div className="game-grid">
                {cells.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className={`game-row ${currentRow === rowIndex ? "current" : ""} ${gameState.isWon ? "isWon" : ""}`}
                    >
                        {row.map((_, colIndex) => {
                            const kluroLetter = getKluroLetter(rowIndex, colIndex, grid);
                            const guessValue = currentRow === rowIndex && guess[colIndex];
                            const isRevealing = rowIndex === currentRow - 1;

                            // Determine if this letter should be hidden pending reveal
                            const isPendingReveal = isRevealing && !revealingIndices.has(colIndex);
                            const revealClass = isPendingReveal ? 'pending-reveal' : isRevealing ? 'revealing' : ''

                            const isActive = !gameState.isWon && rowIndex === currentRow && activeMarker === colIndex ? "active" : ""
                            const isSelected = !gameState.isWon && currentRow === rowIndex &&
                                activeSelection === colIndex ? "selected" : ""

                            return (
                                <div
                                    onClick={() => onSelectSquare(rowIndex, colIndex)}
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`game-cell ${isActive} ${revealClass} ${isSelected}`}
                                >
                                    {kluroLetter && !guessValue && (
                                        <div
                                            className={`letter ${kluroLetter.status}`}>
                                            {kluroLetter.letter}
                                        </div>
                                    )}
                                    {guessValue && (
                                        <div className="letter">
                                            {guessValue}
                                        </div>
                                    )}
                                    {isSelected && (
                                        <span className="erase" onClick={onErase}>&times;</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
});

export default GameGrid;
