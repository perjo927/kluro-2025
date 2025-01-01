import './GameGrid.css';

const cells = Array(6).fill(null).map(() =>
    Array(5).fill(null)
);

const getKluroLetter = (row, col, grid) => {
    return grid[row]?.[col]
}

const GameGrid = (({ gameState }) => {
    if (!gameState) return null;

    const { grid } = gameState;

    return (
        <div className="gamegrid-container">
            <div className="game-grid">
                {cells.map((row, rowIndex) => (
                    <div key={rowIndex} className="game-row">
                        {row.map((_, colIndex) => {
                            const kluroLetter = getKluroLetter(rowIndex, colIndex, grid)
                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className="game-cell"
                                >
                                    {kluroLetter && (
                                        <div className={`letter ${kluroLetter.status}`}>
                                            {kluroLetter.letter}
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
