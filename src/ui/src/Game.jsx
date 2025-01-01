import './Game.css'
import { useEffect, useState } from 'react';
import GameGrid from './components/GameGrid';
import Header from './components/Header';
import { GameOverModal } from './components/Modal.jsx';
import { useToast } from './ToastContext.jsx';
import About from './components/About.jsx';
import WordleEngine from '../../lib/engine.js';
import Keyboard from './components/Keyboard.jsx';


class Kluro {
    constructor(word) {
        this.game = new WordleEngine(word)
    }

    getShareableResult(state) {
        const date = new Date().toLocaleDateString();
        const title = "🅺🅻🆄🆁🅾"

        return `
🅰️ ${title} ${date}

TODO: RESULT
X/X
GRID
`;
    }

    start() {
        const lastSavedDate = localStorage.getItem(`kluro-dateStr`);
        const today = new Date().toISOString().split('T')[0];
        const isPlayingToday =
            lastSavedDate &&
            new Date(lastSavedDate).getTime() === new Date(today).getTime();

        if (isPlayingToday) {
            // TODO: and if has completed, check game over
            // return state
        }

        // If no saved state, initialize new game and return state
        return null;
    }
}

function GameContainer() {
    const [game, setGame] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [showAbout, setShowAbout] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);

    const toast = useToast();

    useEffect(() => {
        // TODO: decrypt daily word
        const kluro = new Kluro("GISSA");

        const savedState = kluro.start()

        if (savedState) {
            setGameState(savedState)
        }

        kluro.game.makeGuess("HITTG");
        kluro.game.makeGuess("STICK");
        console.log(kluro.game.gameState.grid);
        setGameState(kluro.game.gameState);


        return () => { }
    }, []);

    const handleShareResult = () => {
        const result = game.getShareableResult(gameState);

        navigator.clipboard.writeText(result)
            .then(() => {
                toast('Result copied to clipboard! 📋', 'success');
            })
            .catch((e) => {
                console.error(e);
                toast('Failed to copy result', 'error');
            });
    }

    if (!gameState) return null;

    return (
        <>
            <Header
                onShowAbout={() => setShowAbout(true)}
            />
            <div className="game-container">
                <main className="game-layout">
                    <div className="game-main">
                        <GameGrid gameState={gameState} />
                        <Keyboard
                            gameState={gameState}
                            onEnter={() => { }}
                            onBack={() => { }}
                            onPressKey={() => { }}
                        />
                    </div>
                </main>
                {showAbout && (
                    <About onClose={() => setShowAbout(false)} />
                )}
            </div>

            <GameOverModal
                isOpen={showGameOver}
                onClose={() => { }}
                gameState={gameState}
                onShare={handleShareResult}
            />
        </>
    );
}

export default GameContainer
