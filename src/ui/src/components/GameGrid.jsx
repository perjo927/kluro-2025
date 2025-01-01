import './GameGrid.css';

const cells = Array(6).fill(null).map(() =>
    Array(5).fill(null)
);

const getKluroLetter = (row, col, grid) => {
    return grid[row]?.[col]
}

const GameGrid = (({ gameState = null, currentRow = 0, activeMarker = [0, 0], currentGuess = "" }) => {
    if (!gameState) return null;

    const { grid } = gameState;
    const guess = currentGuess.split("");

    return (
        <div className="gamegrid-container">
            <div className="game-grid">
                {cells.map((row, rowIndex) => (
                    <div
                        key={rowIndex}
                        className={`game-row ${currentRow === rowIndex ? "current" : ""}`}>
                        {row.map((_, colIndex) => {
                            const kluroLetter = getKluroLetter(rowIndex, colIndex, grid);
                            const guessValue = currentRow === rowIndex && guess[colIndex];

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={
                                        `game-cell ${activeMarker[0] === rowIndex && activeMarker[1] === colIndex ?
                                            "active" : ""
                                        }`
                                    }
                                >
                                    {kluroLetter && !guessValue && (
                                        <div className={`letter ${kluroLetter.status}`}>
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
