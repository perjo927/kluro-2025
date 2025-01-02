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

const text = new Audio('audio/text.wav');
const back = new Audio('audio/back.wav');
const victory = new Audio('audio/victory.wav');
const wrong = new Audio('audio/wrong.wav');
const die = new Audio('audio/die.wav');
const nice = new Audio('audio/nice.wav');

const audio = {
    text,
    back,
    victory,
    wrong,
    die,
    nice
}


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
        } else {
            localStorage.removeItem("gameState")
        }

        const { word, gameDay } = WordleEngine.getTodaysWord();

        this.gameDay = gameDay;
        this.game = new WordleEngine(word.toUpperCase(), state);
    }

    getShareableResult(state) {
        const rows = state.grid.length;
        const won = state.isWon;
        const date = new Date().toLocaleDateString();

        // Create emoji grid
        const grid = state.grid.map(row =>
            row.map(cell => {
                switch (cell.status) {
                    case 'correct': return '🟩';
                    case 'present': return '🟨';
                    case 'absent': return '⬛';
                    default: return '⬜';
                }
            }).join('')
        ).join('\n');

        return `
🄺🄻🅄🅁🄾 ${date} #${this.gameDay}
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
    const [activeMarker, setActiveMarker] = useState(0);
    const [activeSelection, setActiveSelection] = useState(-1);
    const [isWon, setIsWon] = useState(false);
    const [currentGuess, setCurrentGuess] = useState("     ");
    const [showConfetti, setShowConfetti] = useState(false);
    const [volumeOff, setVolumeOff] = useState(true);

    const toast = useToast();

    const onErase = () => {
        if (!volumeOff) {
            audio.back.play();
        }

        const positions = Array(5).fill("");
        const guessPositions = currentGuess.split("");
        const guessCharacters = positions.map((cell, i) => {
            return guessPositions[i] ?? ""
        });

        guessCharacters[activeMarker] = " ";
        const newGuess = guessCharacters.join("");
        setCurrentGuess(newGuess);
    }

    const onBack = () => {
        if (currentGuess.length > 0) {
            if (!volumeOff) {
                audio.back.play();
            }

            const positions = Array(5).fill("");
            const guessPositions = currentGuess.split("");
            const guessCharacters = positions.map((cell, i) => {
                return guessPositions[i] ?? " "
            })

            const cellHasContent = guessCharacters[activeMarker] !== "" && guessCharacters[activeMarker] !== " ";

            if (cellHasContent) {
                guessCharacters[activeMarker] = " "
            } else {
                guessCharacters[activeMarker - 1] = " "
            }

            const newGuess = guessCharacters.join("")
            setCurrentGuess(newGuess);
            setActiveSelection(-1)

            if (cellHasContent || activeMarker === 0) {
                return;
            } else {
                setActiveMarker(prev => prev - 1);
            }
        }
    }

    const onEnter = () => {
        setActiveSelection(-1)

        // Only allow submission of complete words
        if (currentGuess.length !== 5) {
            toast('Ordets längd måste vara 5 bokstäver', 'error');
            shakeCurrentRow();
            if (!volumeOff) {
                audio.wrong.play();
            }
            return;
        }

        // Validate word
        if (!WordleEngine.validateWord(currentGuess)) {
            toast('Ordet finns inte i ordlistan', 'error');
            shakeCurrentRow();
            if (!volumeOff) {
                audio.wrong.play();
            }
            return;
        }

        try {
            // Make the guess
            const newState = game.makeGuess(currentGuess);

            if (!volumeOff) {
                audio.nice.play();
            }

            // Update last played date
            const today = new Date().toDateString();
            localStorage.setItem('lastPlayedDate', today);

            // Instead of updating everything immediately,
            // use our new handler for game over state
            if (newState.isComplete) {
                handleGameOver(newState);

                if (newState.isWon) {
                    if (!volumeOff) {
                        audio.victory.play();
                    }
                } else {
                    if (!volumeOff) {
                        audio.die.play();
                    }
                }
            } else {
                // For non-game-over states, update immediately
                setGameState(newState);
                setCurrentRow(newState.currentRow);
            }

            setCurrentGuess("     ");
            setActiveMarker(0);
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

        setActiveSelection(-1)

        // Handle the key press
        if (activeMarker < 5) {
            if (!volumeOff) {
                audio.text.play();
            }

            const nextGuess = Array(5).fill("");
            const guessPositions = currentGuess.split("");

            const characterList = nextGuess.map((cell, i) => {
                if (activeMarker === i) {
                    return key;
                }
                if (guessPositions[i]) {
                    return guessPositions[i];
                }
                return " ";
            })
            const newGuess = characterList.join("");

            setCurrentGuess(newGuess);

            // Update active marker
            if (activeMarker === 4) {
                setActiveMarker(4);
            } else {
                setActiveMarker(prev => prev + 1);
            }
        }
    }

    const handleShareResult = () => {
        const result = kluro.getShareableResult(gameState);

        navigator.clipboard.writeText(result)
            .then(() => {
                toast('Resultatet kopierades! 📋', 'success');
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

    const shakeCurrentRow = () => {
        const currentRowElement = document.querySelector(`.game-row:nth-child(${currentRow + 1})`);
        currentRowElement.classList.add('shake');

        // Remove the shake class after animation completes
        setTimeout(() => {
            currentRowElement.classList.remove('shake');
        }, 500);
    };

    const onSelectSquare = (row, col) => {
        if (gameState.isComplete) {
            return;
        }
        if (row === currentRow) {
            setActiveMarker(col)
            setActiveSelection(col)
        }
    };

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

            switch (key) {
                case "ARROWLEFT":
                    if (activeMarker > 0) {
                        setActiveMarker(prev => prev - 1);
                    }
                    break;
                case "ARROWRIGHT":
                    if (activeMarker < 4) {
                        setActiveMarker(prev => prev + 1);
                    }
                    break;
                case 'ENTER':
                    onEnter();
                    break;
                case 'BACKSPACE':
                    onBack();
                    break;
                default:
                    if (/^[A-ZÅÄÖ]$/.test(key)) {
                        onPressKey(key, activeMarker);
                    }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentGuess, gameState, activeMarker, onBack, onEnter, onPressKey]); // Add other dependencies as needed


    if (!gameState) return null;

    return (
        <>
            <Confetti isActive={showConfetti} />
            <Header
                onShowAbout={() => setShowAbout(true)}
                volumeOff={volumeOff}
                onVolumeOffToggle={(v) => setVolumeOff(v)}
            />
            <div className="game-container">
                <main className="game-layout">
                    <div className="game-main">
                        <GameGrid
                            gameState={gameState}
                            activeMarker={activeMarker}
                            activeSelection={activeSelection}
                            currentRow={currentRow}
                            currentGuess={currentGuess}
                            onSelectSquare={onSelectSquare}
                            onErase={onErase}
                        />
                        <Keyboard
                            activeMarker={activeMarker}
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
