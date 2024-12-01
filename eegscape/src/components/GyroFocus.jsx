import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const GyroFocus = ({ setActiveComponent }) => {
    const { tilt } = useReceiveEeg();
    const [pitchValue, setPitchValue] = useState(null);
    const [playerPosition, setPlayerPosition] = useState(0);
    const [targetPosition, setTargetPosition] = useState(45);
    const [score, setScore] = useState(0);
    const [isAligned, setIsAligned] = useState(false);

    // Constants for game mechanics
    const ALIGNMENT_THRESHOLD = 7; // Degrees of tolerance for alignment
    const ARC_RADIUS = 100;
    const CENTER_X = 150;
    const CENTER_Y = 150;

    // Convert pitch to position on arc (assuming pitch ranges from -90 to 90)
    const pitchToPosition = useCallback((pitch) => {
        // Clamp pitch between -90 and 90 degrees
        const clampedPitch = Math.max(-90, Math.min(90, pitch));
        return clampedPitch;
    }, []);

    // Generate random position on arc
    const generateNewTarget = useCallback(() => {
        const newPosition = Math.random() * 180 - 90; // Random position between -90 and 90
        setTargetPosition(newPosition);
        setIsAligned(false);
    }, []);

    // Calculate position on arc
    const calculateArcPosition = (angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
            x: CENTER_X + ARC_RADIUS * Math.cos(radians),
            y: CENTER_Y + ARC_RADIUS * Math.sin(radians)
        };
    };

    // Handle confirmation keypress
    useEffect(() => {
        const handleKeyPress = (event) => {
            if (event.code === 'Space' && isAligned) {
                setScore(prev => prev + 1);
                generateNewTarget();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isAligned, generateNewTarget]);

    // Update player position based on pitch
    tilt.useTilt((newPitch) => {
        setPitchValue(newPitch);
        const newPosition = pitchToPosition(newPitch);
        setPlayerPosition(newPosition);
        
        // Check alignment
        const isNowAligned = Math.abs(newPosition - targetPosition) < ALIGNMENT_THRESHOLD;
        setIsAligned(isNowAligned);
    });

    // Handle button confirmation
    const handleConfirm = () => {
        if (isAligned) {
            setScore(prev => prev + 1);
            generateNewTarget();
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="relative w-96 h-96">
                {/* Background Arc */}
                <svg className="absolute top-0 left-0" width="300" height="300" viewBox="0 0 300 300">
                    <path
                        d="M 50 150 A 100 100 0 0 1 250 150"
                        fill="none"
                        stroke="#CBD5E0"
                        strokeWidth="4"
                    />
                    
                    {/* Target Circle */}
                    <circle
                        cx={calculateArcPosition(targetPosition).x}
                        cy={calculateArcPosition(targetPosition).y}
                        r="15"
                        fill="#F56565"
                    />

                    {/* Player Circle */}
                    <circle
                        cx={calculateArcPosition(playerPosition).x}
                        cy={calculateArcPosition(playerPosition).y}
                        r="10"
                        fill={isAligned ? "#48BB78" : "#4299E1"}
                    />
                </svg>
            </div>

            <div className="mt-8 space-y-4 text-center">
                <p className="text-2xl font-bold">Score: {score}</p>
                <p className="text-lg">
                    {isAligned ? "Aligned! Press SPACE or click Confirm" : "Align the circles by tilting your head"}
                </p>
                <button
                    onClick={handleConfirm}
                    className={`py-2 px-4 rounded ${
                        isAligned 
                            ? "bg-green-500 hover:bg-green-700" 
                            : "bg-gray-400"
                    } text-white mr-4`}
                >
                    Confirm
                </button>
                <button
                    onClick={() => setActiveComponent("menu")}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Exit Game
                </button>
            </div>
        </div>
    );
};

export default GyroFocus;