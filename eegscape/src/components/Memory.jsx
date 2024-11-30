import { useState, useEffect, useCallback } from 'react';
import useEeg from "../hooks/useEeg";

const Memory = () => {
    // Game states
    const [sequence, setSequence] = useState([]);
    const [playerSequence, setPlayerSequence] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isShowingSequence, setIsShowingSequence] = useState(false);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const { concentration, nod } = useEeg();

    // Constants
    const BUTTONS = [
        {
            id: 1,
            color: 'bg-red-500',
            activeColor: 'bg-red-300',
            pressedColor: 'bg-red-200'
        },
        {
            id: 2,
            color: 'bg-blue-500',
            activeColor: 'bg-blue-300',
            pressedColor: 'bg-blue-200'
        },
        {
            id: 3,
            color: 'bg-green-500',
            activeColor: 'bg-green-300',
            pressedColor: 'bg-green-200'
        }
    ];
    const FLASH_DURATION = 500;
    const SEQUENCE_INTERVAL = 1000;

    // Generate next sequence by adding a random button
    const generateNextSequence = useCallback(() => {
        const nextButton = Math.floor(Math.random() * 3) + 1;
        setSequence(prev => [...prev, nextButton]);
    }, []);

    // Show sequence to player
    const showSequence = useCallback(async () => {
        setIsShowingSequence(true);

        for (let i = 0; i < sequence.length; i++) {
            const button = document.getElementById(`button-${sequence[i]}`);
            await new Promise(resolve => setTimeout(resolve, SEQUENCE_INTERVAL));
            button.classList.remove(BUTTONS[sequence[i] - 1].color);
            button.classList.add(BUTTONS[sequence[i] - 1].activeColor);
            await new Promise(resolve => setTimeout(resolve, FLASH_DURATION));
            button.classList.remove(BUTTONS[sequence[i] - 1].activeColor);
            button.classList.add(BUTTONS[sequence[i] - 1].color);
        }

        setIsShowingSequence(false);
    }, [sequence]);

    // Handle button clicks
    const handleButtonClick = (buttonId) => {
        if (isShowingSequence || !isPlaying) return;

        const newPlayerSequence = [...playerSequence, buttonId];
        setPlayerSequence(newPlayerSequence);

        // Check if the player's sequence matches so far
        const isCorrect = newPlayerSequence.every(
            (button, index) => button === sequence[index]
        );

        if (!isCorrect) {
            setGameOver(true);
            setIsPlaying(false);
            return;
        }

        // If player completed the sequence correctly
        if (newPlayerSequence.length === sequence.length) {
            setScore(score + 1);
            setPlayerSequence([]);
            setTimeout(() => {
                generateNextSequence();
            }, SEQUENCE_INTERVAL);
        }
    };

    // // EEG nod handlers
    // nod.useNodLeft(() => {
    //     handleButtonClick(1); // Left button (red)
    // });

    // nod.useNodBottom(() => {
    //     handleButtonClick(2); // Middle button (blue)
    // });

    // nod.useNodRight(() => {
    //     handleButtonClick(3); // Right button (green)
    // });

    // Start new game
    const startGame = () => {
        setSequence([]);
        setPlayerSequence([]);
        setScore(0);
        setGameOver(false);
        setIsPlaying(true);
        generateNextSequence();
    };

    // Show sequence whenever it changes
    useEffect(() => {
        if (sequence.length > 0 && isPlaying) {
            showSequence();
        }
    }, [sequence, isPlaying, showSequence]);

    return (
        <div className="text-center p-8">
            <h1 className="text-2xl font-bold mb-8">Memory Game</h1>

            <div className="mb-8">
                <p className="text-lg mb-4">Score: {score}</p>
                {!isPlaying && (
                    <button
                        onClick={startGame}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                    >
                        {gameOver ? 'Play Again' : 'Start Game'}
                    </button>
                )}
                {gameOver && (
                    <p className="text-red-500 mt-4">Game Over! Final Score: {score}</p>
                )}
            </div>

            <div className="flex justify-center gap-4 mb-8">
                {BUTTONS.map(({ id, color }) => (
                    <button
                        key={id}
                        id={`button-${id}`}
                        onClick={() => handleButtonClick(id)}
                        disabled={!isPlaying || isShowingSequence}
                        className={`w-24 h-24 rounded-full ${color} 
              transition-colors duration-200 
              ${(!isPlaying || isShowingSequence) ? 'opacity-50' : 'hover:opacity-80'}`}
                    />
                ))}
            </div>

            <div className="text-lg">
                {isPlaying && !gameOver && (
                    <p>
                        {isShowingSequence
                            ? 'Watch the sequence...'
                            : 'Your turn! Repeat the sequence'}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Memory;