import words from "../data/words";

const firstIndexDate = 1644534000000;
const firstDateSinceEpoch = Math.floor(firstIndexDate / 8.64e7);

class WordleEngine {
    constructor(dailyWord, state) {
        this.dailyWord = dailyWord.toUpperCase();
        this.gameState = state ?? {
            grid: [],         // Will contain letter placements and feedback
            keyboard: {},     // Will track letter states for keyboard
            isComplete: false,
            isWon: false,
            currentRow: 0,
            revealedWord: null
        };

        // Initialize keyboard state for all Swedish letters
        'ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ'.split('').forEach(letter => {
            this.gameState.keyboard[letter] = 'unused'; // Other states: 'correct', 'present', 'absent'
        });
    }

    // Process a new guess and return updated state
    makeGuess(guess) {
        if (this.gameState.isComplete) {
            throw new Error('Game is already complete');
        }

        if (!guess || typeof guess !== 'string') {
            throw new Error('Invalid guess type');
        }

        const normalizedGuess = guess.toUpperCase();

        // Validate guess length
        if (normalizedGuess.length !== this.dailyWord.length) {
            throw new Error('Invalid guess length');
        }

        if (!/^[A-ZÅÄÖ]+$/.test(normalizedGuess)) {
            throw new Error('Invalid characters in guess');
        }

        // Create feedback for this guess
        const rowFeedback = this.generateFeedback(normalizedGuess);

        // Update grid state with new row
        this.gameState.grid[this.gameState.currentRow] = rowFeedback;

        // Update keyboard state based on feedback
        this.updateKeyboardState(rowFeedback);

        // Check win condition
        const isWin = normalizedGuess === this.dailyWord;

        // Update game state
        this.gameState.currentRow += 1;
        this.gameState.isComplete = isWin || this.gameState.currentRow >= 6;
        this.gameState.isWon = isWin;

        // Reveal word if game is over
        if (this.gameState.isComplete) {
            this.gameState.revealedWord = this.dailyWord;
        }

        // Return new state (immutably)
        return { ...this.gameState };
    }

    // Generate feedback for a guess
    generateFeedback(guess) {
        const feedback = Array(guess.length).fill('absent');
        const dailyWordArray = this.dailyWord.split('');
        const remainingLetters = [...dailyWordArray];
        const usedPositions = new Set();

        // First pass: Mark correct positions
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === this.dailyWord[i]) {
                feedback[i] = 'correct';
                remainingLetters[i] = null;
                usedPositions.add(i);
            }
        }

        // Second pass: Mark present but wrong position
        for (let i = 0; i < guess.length; i++) {
            if (feedback[i] !== 'correct') {
                const remainingIndex = remainingLetters.findIndex((letter, index) =>
                    !usedPositions.has(index) && letter === guess[i]
                );

                if (remainingIndex !== -1) {
                    feedback[i] = 'present';
                    remainingLetters[remainingIndex] = null;
                    usedPositions.add(remainingIndex);
                }
            }
        }

        return guess.split('').map((letter, index) => ({
            letter,
            status: feedback[index]
        }));
    }

    updateKeyboardState(rowFeedback) {
        // Consider adding a priority map for status updates
        const statusPriority = {
            correct: 3,
            present: 2,
            absent: 1,
            unused: 0
        };

        rowFeedback.forEach(({ letter, status }) => {
            const currentStatus = this.gameState.keyboard[letter];
            if (statusPriority[status] > statusPriority[currentStatus]) {
                this.gameState.keyboard[letter] = status;
            }
        });
    }

    getSerializableState() {
        return JSON.stringify(this.gameState);
    }

    loadState(savedState) {
        this.gameState = JSON.parse(savedState);
    }

    static validateWord(word) {
        const input = word.toLowerCase();
        return words.includes(btoa(input));
    }

    static getTodaysWord() {
        const now = new Date();
        const nowSinceEpoch = Math.floor(now / 8.64e7);
        const diffDays = nowSinceEpoch - firstDateSinceEpoch;

        return { word: atob(words[diffDays]), gameDay: diffDays }
    }
}

export default WordleEngine
