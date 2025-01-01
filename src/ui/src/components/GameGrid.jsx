import { useEffect, useState } from 'react';
import './GameGrid.css';

const cells = Array(6).fill(null).map(() =>
    Array(5).fill(null)
);

const getKluroLetter = (row, col, grid) => {
    return grid[row]?.[col]
}

const GameGrid = (({ gameState = null, currentRow = 0, activeMarker = [0, 0], currentGuess = "" }) => {
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

        // Add bounce animation after all letters have flipped
        setTimeout(() => {
            const row = document.querySelector(`.game-row:nth-child(${currentRow})`);
            row.classList.add('bounce');

            setTimeout(() => {
                row.classList.remove('bounce');
            }, 500);
        }, 5 * 200 + 100); // Wait for all letters plus a small buffer

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
                        className={`game-row ${currentRow === rowIndex ? "current" : ""}`}
                    >
                        {row.map((_, colIndex) => {
                            const kluroLetter = getKluroLetter(rowIndex, colIndex, grid);
                            const guessValue = currentRow === rowIndex && guess[colIndex];
                            const isRevealing = rowIndex === currentRow - 1;

                            // Determine if this letter should be hidden pending reveal
                            const isPendingReveal = isRevealing && !revealingIndices.has(colIndex);

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`game-cell ${activeMarker[0] === rowIndex &&
                                        activeMarker[1] === colIndex ? "active" : ""
                                        }`}
                                >
                                    {kluroLetter && !guessValue && (
                                        <div className={`letter ${kluroLetter.status} ${isPendingReveal ? 'pending-reveal' :
                                            isRevealing ? 'revealing' : ''
                                            }`}>
                                            {kluroLetter.letter}
                                        </div>
                                    )}
                                    {guessValue && (
                                        <div className="letter">
                                            {guessValue}
                                        </div>
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
