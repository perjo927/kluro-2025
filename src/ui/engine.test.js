import { describe, test, expect } from 'vitest';
import WordleEngine from '../lib/engine';

// Helper function to convert game state to visual grid representation
function visualizeGrid(grid) {
    return grid.map(row => {
        const emoji = row.map(({ status }) => {
            switch (status) {
                case 'correct': return '🟩';
                case 'present': return '🟨';
                case 'absent': return '⬛';
                default: return '⬜';
            }
        }).join('');

        const word = row.map(({ letter }) => letter).join('');
        return `${emoji} ${word}`;
    }).join('\n');
}

// Test suite
describe('WordleEngine', () => {


    test('handles a winning game sequence correctly', () => {
        const engine = new WordleEngine('SKÖLP');
        const guesses = ['FOAJE', 'LURIG', 'STYCK', 'SKÄLL', 'SKÖLD', 'SKÖLP'];
        const states = [];

        // We'll define the expected states for each guess
        const expectedFeedback = [
            // FOAJE - No correct letters
            [
                { letter: 'F', status: 'absent' },
                { letter: 'O', status: 'absent' },
                { letter: 'A', status: 'absent' },
                { letter: 'J', status: 'absent' },
                { letter: 'E', status: 'absent' }
            ],
            // LURIG - Only L is present but in wrong position
            [
                { letter: 'L', status: 'present' },
                { letter: 'U', status: 'absent' },
                { letter: 'R', status: 'absent' },
                { letter: 'I', status: 'absent' },
                { letter: 'G', status: 'absent' }
            ],
            // STYCK - S is correct, K is present
            [
                { letter: 'S', status: 'correct' },
                { letter: 'T', status: 'absent' },
                { letter: 'Y', status: 'absent' },
                { letter: 'C', status: 'absent' },
                { letter: 'K', status: 'present' }
            ],
            // SKÄLL - SK correct, L correct
            [
                { letter: 'S', status: 'correct' },
                { letter: 'K', status: 'correct' },
                { letter: 'Ä', status: 'absent' },
                { letter: 'L', status: 'correct' },
                { letter: 'L', status: 'absent' }
            ],
            // SKÖLD - SKÖL correct, D wrong
            [
                { letter: 'S', status: 'correct' },
                { letter: 'K', status: 'correct' },
                { letter: 'Ö', status: 'correct' },
                { letter: 'L', status: 'correct' },
                { letter: 'D', status: 'absent' }
            ],
            // SKÖLP - Perfect match
            [
                { letter: 'S', status: 'correct' },
                { letter: 'K', status: 'correct' },
                { letter: 'Ö', status: 'correct' },
                { letter: 'L', status: 'correct' },
                { letter: 'P', status: 'correct' }
            ]
        ];

        // Make all guesses and verify each state
        guesses.forEach((guess, guessIndex) => {
            const state = engine.makeGuess(guess);
            states.push(state);

            console.log('\nAfter guess:', guess);
            console.log(visualizeGrid(state.grid));

            // Verify each position in the current row
            expectedFeedback[guessIndex].forEach((expected, position) => {
                expect(state.grid[guessIndex][position].letter).toBe(
                    expected.letter,
                    `Guess ${guessIndex + 1}, position ${position}: Should contain letter ${expected.letter}`
                );
                expect(state.grid[guessIndex][position].status).toBe(
                    expected.status,
                    `Guess ${guessIndex + 1}, position ${position}: Should have status ${expected.status}`
                );
            });
        });

        const finalState = states[states.length - 1];
        expect(finalState.isComplete).toBe(true);
        expect(finalState.isWon).toBe(true);
        expect(finalState.revealedWord).toBe('SKÖLP');
        expect(finalState.currentRow).toBe(6);
    });

    test('handles duplicate letters correctly', () => {
        const engine = new WordleEngine('PASSA');
        const state = engine.makeGuess('PAPPA');

        console.log('\nTesting duplicate letters (word: PASSA, guess: PAPPA)');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'P', status: 'correct' }, // First P is correct
            { letter: 'A', status: 'correct' }, // A is correct
            { letter: 'P', status: 'absent' },  // Second P is absent (no more Ps in target)
            { letter: 'P', status: 'absent' },  // Third P is absent (no more Ps in target)
            { letter: 'A', status: 'correct' }  // Last A is correct
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });
    });

    test('handles Swedish characters correctly', () => {
        const engine = new WordleEngine('ÄRTSÖ');
        const state = engine.makeGuess('ÅRÄTS');

        console.log('\nTesting Swedish characters (word: ÄRTSÖ, guess: ÅRÄTS)');
        console.log(visualizeGrid(state.grid));

        // Let's check each position in detail
        const expectedStatuses = [
            { letter: 'Å', status: 'absent' },   // Å isn't in the target word
            { letter: 'R', status: 'correct' },  // R is in the correct position
            { letter: 'Ä', status: 'present' },  // Ä is in the word but wrong position
            { letter: 'T', status: 'present' },  // T is in the word but wrong position
            { letter: 'S', status: 'present' }   // S is in the word but wrong position
        ];

        // Assert each position individually with descriptive messages
        expectedStatuses.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(expected.letter,
                `Position ${index} should contain letter ${expected.letter}`);
            expect(state.grid[0][index].status).toBe(expected.status,
                `Position ${index} should have status ${expected.status}`);
        });
    });

    test('keyboard state updates correctly', () => {
        const engine = new WordleEngine('KÄTTÄ');
        const state = engine.makeGuess('ÄPPLE');

        console.log('\nTesting keyboard state updates (word: KÄTTÄ, guess: ÄPPLE)');
        console.log(visualizeGrid(state.grid));

        // Test each position of the guess
        const expectedPositions = [
            { letter: 'Ä', status: 'present' }, // Ä exists but wrong position
            { letter: 'P', status: 'absent' },  // P not in word
            { letter: 'P', status: 'absent' },  // P not in word
            { letter: 'L', status: 'absent' },  // L not in word
            { letter: 'E', status: 'absent' }   // E not in word
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });

        // Verify keyboard state for special characters
        expect(state.keyboard['Ä']).toBe('present');
        expect(state.keyboard['Å']).toBe('unused');
        expect(state.keyboard['Ö']).toBe('unused');
    });

    test('handles loss condition correctly', () => {
        const engine = new WordleEngine('ÅSKBY');

        // Make 6 incorrect guesses
        const guesses = ['KARTA', 'BORDE', 'LUNCH', 'MYSKO', 'PÄRLA', 'VÄSKA'];
        const states = [];

        console.log('\nTesting loss condition (word: ÅSKBY)');
        guesses.forEach(guess => {
            const state = engine.makeGuess(guess);
            states.push(state);
            console.log(visualizeGrid(state.grid));
        });

        const finalState = states[states.length - 1];

        // Verify loss condition
        expect(finalState.isComplete).toBe(true);
        expect(finalState.isWon).toBe(false);
        expect(finalState.revealedWord).toBe('ÅSKBY');
    });

    test('handles attempt to guess after game is complete', () => {
        const engine = new WordleEngine('HUNDE');

        // Win the game
        const state = engine.makeGuess('HUNDE');
        console.log('\nTesting post-win guesses');
        console.log(visualizeGrid(state.grid));

        // Try to make another guess
        expect(() => engine.makeGuess('KATT')).toThrow('Game is already complete');
    });

    test('handles word with same letter appearing three times', () => {
        const engine = new WordleEngine('MASSA');  // Target word has three 'A's
        const state = engine.makeGuess('PARAT');   // Guess has two 'A's

        console.log('\nTesting triple letter handling (word: MASSA, guess: PARAT)');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'P', status: 'absent' },   // P isn't in word
            { letter: 'A', status: 'correct' },  // First A matches position
            { letter: 'R', status: 'absent' },   // R isn't in word
            { letter: 'A', status: 'present' },  // Second A exists but wrong position
            { letter: 'T', status: 'absent' }    // T isn't in word
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });
    });

    test('handles progressive keyboard state updates across multiple guesses', () => {
        const engine = new WordleEngine('KATEN');

        // First guess: TALEN - T in wrong position, A in wrong position
        let state = engine.makeGuess('TLAEN');

        console.log('\nTesting progressive keyboard updates');
        console.log('After first guess (TLAEN):');
        console.log(visualizeGrid(state.grid));

        // Verify initial keyboard state
        expect(state.keyboard['T']).toBe('present');
        expect(state.keyboard['L']).toBe('absent');
        expect(state.keyboard['A']).toBe('present');
        expect(state.keyboard['E']).toBe('correct');
        expect(state.keyboard['N']).toBe('correct');

        // Second guess: KATEN - All letters correct
        state = engine.makeGuess('KATEN');
        console.log('After second guess (KATEN):');
        console.log(visualizeGrid(state.grid));

        // Verify keyboard state updates properly
        expect(state.keyboard['K']).toBe('correct');
        expect(state.keyboard['A']).toBe('correct');
        expect(state.keyboard['T']).toBe('correct');
        expect(state.keyboard['E']).toBe('correct');
        expect(state.keyboard['N']).toBe('correct');
    });

    test('handles invalid guess length', () => {
        const engine = new WordleEngine('KATT');

        // Try too short
        expect(() => engine.makeGuess('KAT')).toThrow('Invalid guess length');

        // Try too long
        expect(() => engine.makeGuess('KATTE')).toThrow('Invalid guess length');
    });

    test('handles all letters absent correctly', () => {
        const engine = new WordleEngine('ÅSKAN');
        const state = engine.makeGuess('MIRTU');

        console.log('\nTesting all absent letters (word: ÅSKAN, guess: MIRTU)');
        console.log(visualizeGrid(state.grid));

        // Every position should be marked as absent
        state.grid[0].forEach((position, index) => {
            expect(position.status).toBe('absent',
                `Position ${index} (${position.letter}) should be absent`);
        });
    });

    test('handles consecutive identical letters correctly', () => {
        const engine = new WordleEngine('MÖSSA');  // Double S
        const state = engine.makeGuess('KISSA');   // Double S

        console.log('\nTesting consecutive identical letters (word: MÖSSA, guess: KISSA)');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'K', status: 'absent' },   // K isn't in word
            { letter: 'I', status: 'absent' },   // I isn't in word
            { letter: 'S', status: 'correct' },  // First S matches
            { letter: 'S', status: 'correct' },  // Second S matches
            { letter: 'A', status: 'correct' }   // A matches
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });
    });

    // Add these new test cases to the test suite

    test('handles multiple occurrences of present letters correctly', () => {
        const engine = new WordleEngine('KALLA');  // Two 'L's in word
        const state = engine.makeGuess('HALVA');   // One 'L' in wrong spot

        console.log('\nTesting multiple occurrences with partial matches');
        console.log('Target word: KALLA, Guess: HALVA');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'H', status: 'absent' },   // H isn't in word
            { letter: 'A', status: 'correct' },  // First A matches
            { letter: 'L', status: 'correct' },  // L exists (but there are two Ls in target)
            { letter: 'V', status: 'absent' },   // V isn't in word
            { letter: 'A', status: 'correct' }   // Last A matches
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });

        expect(state.keyboard['H']).toBe('absent');   // H isn't in word
        expect(state.keyboard['A']).toBe('correct');  // A appears and is correct
        expect(state.keyboard['L']).toBe('correct');  // L appears and is correct
        expect(state.keyboard['V']).toBe('absent');   // V isn't in word
    });

    test('handles mixed case input correctly', () => {
        const engine = new WordleEngine('ÅSKAN');
        const state = engine.makeGuess('åSkAn');  // Mixed case input

        console.log('\nTesting mixed case input');
        console.log('Target word: ÅSKAN, Guess: åSkAn');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'Å', status: 'correct' },
            { letter: 'S', status: 'correct' },
            { letter: 'K', status: 'correct' },
            { letter: 'A', status: 'correct' },
            { letter: 'N', status: 'correct' }
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Letter should be normalized to uppercase`
            );
        });
    });

    test('handles partial word matches with repeated letters', () => {
        const engine = new WordleEngine('VILLA');
        const state = engine.makeGuess('LILLA');  // Extra L that isn't in target position

        console.log('\nTesting partial matches with repeated letters');
        console.log('Target word: VILLA, Guess: LILLA');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'L', status: 'absent' },  // L exists but not here
            { letter: 'I', status: 'correct' },  // I matches
            { letter: 'L', status: 'correct' },  // First L matches
            { letter: 'L', status: 'correct' },   // Second L matches
            { letter: 'A', status: 'correct' }   // A matches
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });

        expect(state.keyboard['L']).toBe('correct');  // L should show as correct since some L's are correct
        expect(state.keyboard['I']).toBe('correct');  // I is correct
        expect(state.keyboard['A']).toBe('correct');  // A is correct
    });

    test('handles partial word matches with repeated letters', () => {
        const engine = new WordleEngine('VILLA');
        const state = engine.makeGuess('LIKLA');  // Extra L that isn't in target position

        console.log('\nTesting partial matches with repeated letters');
        console.log('Target word: VILLA, Guess: LIKLA');
        console.log(visualizeGrid(state.grid));

        const expectedPositions = [
            { letter: 'L', status: 'present' },
            { letter: 'I', status: 'correct' },
            { letter: 'K', status: 'absent' },
            { letter: 'L', status: 'correct' },
            { letter: 'A', status: 'correct' }
        ];

        expectedPositions.forEach((expected, index) => {
            expect(state.grid[0][index].letter).toBe(
                expected.letter,
                `Position ${index}: Should contain letter ${expected.letter}`
            );
            expect(state.grid[0][index].status).toBe(
                expected.status,
                `Position ${index}: Should have status ${expected.status}`
            );
        });

        expect(state.keyboard['L']).toBe('correct');  // L should show as correct since some L's are correct
        expect(state.keyboard['I']).toBe('correct');  // I is correct
        expect(state.keyboard['A']).toBe('correct');  // A is correct
    });

    test('handles keyboard state with multiple guesses containing same letter', () => {
        const engine = new WordleEngine('MATTA');

        // First guess has T in wrong position
        let state = engine.makeGuess('STUGA');
        console.log('\nTesting multiple guesses with same letter');
        console.log('Target word: MATTA');
        console.log('First guess: STUGA');
        console.log(visualizeGrid(state.grid));

        // T should be marked as present initially
        expect(state.keyboard['T']).toBe('present');

        // Second guess has T in correct position
        state = engine.makeGuess('MATTA');
        console.log('Second guess: MATTA');
        console.log(visualizeGrid(state.grid));

        // T should now be marked as correct
        expect(state.keyboard['T']).toBe('correct');
    });

    test('handles immediate win on first guess', () => {
        const engine = new WordleEngine('DANSA');
        const state = engine.makeGuess('DANSA');

        console.log('\nTesting immediate win');
        console.log('Target word and guess: DANSA');
        console.log(visualizeGrid(state.grid));

        // Verify game state
        expect(state.isComplete).toBe(true);
        expect(state.isWon).toBe(true);
        expect(state.currentRow).toBe(1);
        expect(state.revealedWord).toBe('DANSA');

        // Verify all letters are marked correct in both grid and keyboard
        state.grid[0].forEach((position, index) => {
            expect(position.status).toBe('correct');
            expect(state.keyboard[position.letter]).toBe('correct');
        });
    });

    test('handles invalid input types', () => {
        const engine = new WordleEngine('TESTS');

        // Test null/undefined
        expect(() => engine.makeGuess(null)).toThrow('Invalid guess type');
        expect(() => engine.makeGuess(undefined)).toThrow('Invalid guess type');

        // Test non-string types
        expect(() => engine.makeGuess(123)).toThrow('Invalid guess type');
        expect(() => engine.makeGuess([])).toThrow('Invalid guess type');
    });

    test('validates serialization and deserialization', () => {
        const engine = new WordleEngine('TESTS');
        engine.makeGuess('TESTA');

        const serialized = engine.getSerializableState();
        const newEngine = new WordleEngine('TESTS');
        newEngine.loadState(serialized);

        expect(newEngine.gameState).toEqual(engine.gameState);
    });

    test('handles empty guess string', () => {
        const engine = new WordleEngine('TESTS');
        expect(() => engine.makeGuess('')).toThrow('Invalid guess type');
    });

    test('handles maximum number of guesses exactly', () => {
        const engine = new WordleEngine('TESTS');
        for (let i = 0; i < 6; i++) {
            const state = engine.makeGuess('WRONG');
            if (i < 5) {
                expect(state.isComplete).toBe(false);
            } else {
                expect(state.isComplete).toBe(true);
            }
        }
    });

    test('keyboard state is always consistent', () => {
        const engine = new WordleEngine('TESTS');
        const state = engine.makeGuess('TESTA');

        // Verify no letter has conflicting states
        Object.entries(state.keyboard).forEach(([letter, status]) => {
            if (status === 'correct') {
                // Letter marked correct should appear in that position in daily word
                expect(engine.dailyWord.includes(letter)).toBe(true);
            }
        });
    });

    test('maintains consistent state transitions', () => {
        const engine = new WordleEngine('TESTS');
        const state1 = engine.makeGuess('FIRST');
        expect(state1).toMatchSnapshot('after first guess');

        const state2 = engine.makeGuess('SECND');
        expect(state2).toMatchSnapshot('after second guess');
    });

    test('keyboard state preserves correct status over present status', () => {
        const engine = new WordleEngine('HÄLLA');

        // First guess has Ä in correct position
        let state = engine.makeGuess('HÄNGA');
        expect(state.keyboard['Ä']).toBe('correct');

        // Second guess has Ä in wrong position
        // Should still remain 'correct' from previous guess
        state = engine.makeGuess('ÅÄLLA');
        expect(state.keyboard['Ä']).toBe('correct',
            'Letter should maintain correct status even when later seen in wrong position');
    });

    test('keyboard reflects status upgrades through multiple guesses', () => {
        const engine = new WordleEngine('MATTA');

        // First guess: T appears but in wrong spot
        let state = engine.makeGuess('STUGA');
        expect(state.keyboard['T']).toBe('present',
            'T should be marked as present initially');

        // Second guess: T in correct spot
        state = engine.makeGuess('MASTA');
        expect(state.keyboard['T']).toBe('correct',
            'T should upgrade to correct when found in right position');

        // Third guess: Another T in wrong spot
        state = engine.makeGuess('TITEL');
        expect(state.keyboard['T']).toBe('correct',
            'T should maintain correct status even after seeing it in wrong position');
    });

    test('keyboard handles multiple Swedish characters properly', () => {
        const engine = new WordleEngine('ÅSKAN');

        // Test progression of statuses for Swedish characters
        let state = engine.makeGuess('ÄRTAN');  // Å not present, Ä wrong
        expect(state.keyboard['Å']).toBe('unused');
        expect(state.keyboard['Ä']).toBe('absent');
        expect(state.keyboard['Ö']).toBe('unused');

        state = engine.makeGuess('ÅSKAN');
        expect(state.keyboard['Å']).toBe('correct');
        expect(state.keyboard['Ä']).toBe('absent', 'Previous absent status should persist');
        expect(state.keyboard['Ö']).toBe('unused');

    });

    test('keyboard maintains unused status for untried letters', () => {
        const engine = new WordleEngine('KARTA');
        const state = engine.makeGuess('KARTA');

        // Check that untried letters remain unused
        'BCDEFGHIJLMNOPQSUVWXYZÅÄÖ'.split('').forEach(letter => {
            expect(state.keyboard[letter]).toBe('unused',
                `Letter ${letter} should remain unused when not guessed`);
        });
    });

    test('keyboard state handles full game progression', () => {
        const engine = new WordleEngine('ÅSKAN');

        // Track the progression of keyboard states through a full game
        const progressionMap = new Map();

        // First guess: No correct letters
        let state = engine.makeGuess('BORDE');
        'BORDE'.split('').forEach(letter => {
            progressionMap.set(letter, 'absent');
            expect(state.keyboard[letter]).toBe('absent');
        });

        // Second guess: Some letters present
        state = engine.makeGuess('SANDA');
        expect(state.keyboard['S']).toBe('present');
        expect(state.keyboard['A']).toBe('present');
        progressionMap.set('S', 'present');
        progressionMap.set('A', 'present');

        // Third guess: Some letters become correct
        state = engine.makeGuess('ÅSKAN');

        progressionMap.set('S', 'correct');
        progressionMap.set('A', 'correct');

        // Verify final keyboard state matches accumulated progression
        progressionMap.forEach((expectedStatus, letter) => {
            expect(state.keyboard[letter]).toBe(expectedStatus,
                `Letter ${letter} should maintain its progression through the game`);
        });
    });

    test('keyboard properly handles lost game state', () => {
        const engine = new WordleEngine('ÅSKA');
        let state;

        // Make 6 incorrect guesses
        ['BORD', 'KATT', 'HUND', 'LEJI', 'MÖSS', 'PALM'].forEach(guess => {
            state = engine.makeGuess(guess);
        });

        // Verify final keyboard state for all used letters
        const allGuessedLetters = new Set('BORDKATTHUNDLEJIMÖSSPALM'.split(''));
        allGuessedLetters.forEach(letter => {
            expect(['correct', 'present', 'absent']).toContain(state.keyboard[letter],
                `Letter ${letter} should have a final status after game is lost`);
        });
    });
});
