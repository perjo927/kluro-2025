import './Game.css'
import { useEffect, useState } from 'react';
import GameGrid from './components/GameGrid';
import Header from './components/Header';
import { GameOverModal } from './components/Modal.jsx';
import { useToast } from './ToastContext.jsx';
import About from './components/About.jsx';
import WordleEngine from '../../lib/engine.js';
import Keyboard from './components/Keyboard.jsx';
import Confetti from './components/Confetti.jsx';

const ANIMATION_TIMINGS = {
    LETTER_REVEAL_DELAY: 200,  // Delay between each letter
    FLIP_DURATION: 600,        // Duration of flip animation
    BOUNCE_DURATION: 500,      // Duration of bounce animation
    BUFFER: 500               // Safety buffer
};

class Kluro {
    constructor() {
        let state = null;

        // Get today's date and last played date
        const today = new Date().toDateString();
        const lastPlayed = localStorage.getItem('lastPlayedDate');

        if (lastPlayed === today) {
            // Load saved state if playing today
            const savedState = localStorage.getItem('gameState');
            if (savedState) {
                state = JSON.parse(savedState);
            }
        }

        const { word, gameDay } = WordleEngine.getTodaysWord();
        this.gameDay = gameDay;
        this.game = new WordleEngine(word.toUpperCase(), state);

        // Update last played date
        localStorage.setItem('lastPlayedDate', today);
    }

    getShareableResult(state) {
        const rows = state.grid.length;
        const won = state.isWon;
        const date = new Date().toLocaleDateString();

        const cells = Array(6).fill(null).map(() =>
            Array(5).fill(null)
        );

        const grid = cells.map((row, rowIndex) => {
            const gridRow = state.grid[rowIndex];
            if (gridRow) {
                const newRow = gridRow.map(cell => {
                    switch (cell.status) {
                        case 'correct': return '🟩';
                        case 'present': return '🟨';
                        case 'absent': return '⬛';
                        default: return '⬜';
                    }
                }).join('')
                return newRow
            }
            return '⬛⬛⬛⬛⬛'
        }).join(("\n"))


        return `
🅺🅻🆄🆁🅾 ${date} #${this.gameDay}
${won ? rows : 'X'}/6

${grid}`;
    }
}

function GameContainer() {
    const [game, setGame] = useState(null);
    const [kluro, setKluro] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [showAbout, setShowAbout] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);
    const [currentRow, setCurrentRow] = useState(0);
    const [activeMarker, setActiveMarker] = useState([0, 0]);
    const [isWon, setIsWon] = useState(false);
    const [currentGuess, setCurrentGuess] = useState("");
    const [showConfetti, setShowConfetti] = useState(false);

    const toast = useToast();

    useEffect(() => {
        const kluro = new Kluro();

        setKluro(kluro);
        setGame(kluro.game);
        setGameState(kluro.game.gameState);
        setCurrentRow(kluro.game.gameState.currentRow);
        setShowGameOver(kluro.game.gameState.isComplete);
        setIsWon(kluro.game.gameState.isWon);

        return () => { }
    }, []);

    useEffect(() => {
        const handleKeyDown = (event) => {
            const key = event.key.toUpperCase();

            if (key === 'ENTER') {
                onEnter();
            } else if (key === 'BACKSPACE') {
                onBack();
            } else if (/^[A-ZÅÄÖ]$/.test(key)) {
                onPressKey(key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameState]); // Add other dependencies as needed

    const handleShareResult = () => {
        const result = kluro.getShareableResult(gameState);

        navigator.clipboard.writeText(result)
            .then(() => {
                toast('Resultater kopierades! 📋', 'success');
            })
            .catch((e) => {
                console.error(e);
                toast('Kunde inte kopiera resultat', 'error');
            });
    }

    const handleGameOver = (newState) => {
        // Calculate total animation duration:
        // - 200ms delay between each letter (5 letters = 1000ms total)
        // - 600ms for the flip animation of the last letter
        // - 500ms for the bounce animation
        // Add a small buffer of 100ms for safety
        const totalAnimationDuration =
            (5 * ANIMATION_TIMINGS.LETTER_REVEAL_DELAY) +
            ANIMATION_TIMINGS.FLIP_DURATION +
            ANIMATION_TIMINGS.BOUNCE_DURATION +
            ANIMATION_TIMINGS.BUFFER;

        // Update the game state immediately
        setGameState(newState);
        setCurrentRow(newState.currentRow);
        setIsWon(newState.isWon);

        // Trigger confetti slightly before the modal appears
        if (newState.isWon) {
            setTimeout(() => {
                setShowConfetti(true);
                // Reset confetti after animation
                setTimeout(() => setShowConfetti(false), 2000);
            }, 750);
        }

        // Delay showing the game over modal
        setTimeout(() => {
            setShowGameOver(true);
        }, totalAnimationDuration);
    };

    const onBack = () => {
        if (currentGuess.length > 0) {
            const newGuess = currentGuess.slice(0, -1);
            setCurrentGuess(newGuess);
            setActiveMarker([currentRow, newGuess.length]);
        }
    }

    const onEnter = () => {
        // Only allow submission of complete words
        if (currentGuess.length !== 5) {
            toast('Ordets längd måste vara 5 bokstäver', 'error');
            shakeCurrentRow();
            return;
        }

        // Validate word
        if (!WordleEngine.validateWord(currentGuess)) {
            toast('Ordet finns inte i ordlistan', 'error');
            shakeCurrentRow();
            return;
        }

        try {
            // Make the guess
            const newState = game.makeGuess(currentGuess);

            // Instead of updating everything immediately,
            // use our new handler for game over state
            if (newState.isComplete) {
                handleGameOver(newState);
            } else {
                // For non-game-over states, update immediately
                setGameState(newState);
                setCurrentRow(newState.currentRow);
            }

            setCurrentGuess("");
            setActiveMarker([newState.currentRow, 0]);
            localStorage.setItem('gameState', game.getSerializableState());

            // Save game state (you might want to add this functionality)
            localStorage.setItem('gameState', game.getSerializableState());

        } catch (error) {
            toast(error.message, 'error');
        }
    }

    const onPressKey = (key) => {
        // Skip if game is complete
        if (gameState.isComplete) return;

        // Only allow input in current row
        if (currentRow >= 6) return;

        // Handle the key press
        if (currentGuess.length < 5) {
            const newGuess = currentGuess + key;
            setCurrentGuess(newGuess);

            // Update active marker
            if (activeMarker[1] === 4) {
                setActiveMarker([currentRow, 4]);
            } else {
                setActiveMarker([currentRow, newGuess.length]);
            }
        }

    }

    const shakeCurrentRow = () => {
        const currentRowElement = document.querySelector(`.game-row:nth-child(${currentRow + 1})`);
        currentRowElement.classList.add('shake');

        // Remove the shake class after animation completes
        setTimeout(() => {
            currentRowElement.classList.remove('shake');
        }, 500);
    };

    if (!gameState) return null;

    return (
        <>
            <Confetti isActive={showConfetti} />
            <Header
                onShowAbout={() => setShowAbout(true)}
            />
            <div className="game-container">
                <main className="game-layout">
                    <div className="game-main">
                        <GameGrid
                            gameState={gameState}
                            activeMarker={activeMarker}
                            currentRow={currentRow}
                            currentGuess={currentGuess}
                        />
                        <Keyboard
                            gameState={gameState}
                            onEnter={onEnter}
                            onBack={onBack}
                            onPressKey={onPressKey}
                        />
                    </div>
                </main>
                {showAbout && (
                    <About onClose={() => setShowAbout(false)} />
                )}
            </div>

            <GameOverModal
                isOpen={showGameOver}
                onClose={() => setShowGameOver(false)}
                gameState={gameState}
                onShare={handleShareResult}
                isWon={isWon}
                word={game.dailyWord}
            />
        </>
    );
}

export default GameContainer
