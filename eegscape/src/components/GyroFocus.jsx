import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const GyroFocus = ({ setActiveComponent }) => {
    const { tilt } = useReceiveEeg();
    const [pitchValue, setPitchValue] = useState(null);
    const [playerPosition, setPlayerPosition] = useState(0);
    const [targetPosition, setTargetPosition] = useState(45);
    const [score, setScore] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const [alignmentStartTime, setAlignmentStartTime] = useState(null);
    const [concentrationLevel, setConcentrationLevel] = useState(0); // Ranges from 0 to 100

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
        setConcentrationLevel(0); // Reset concentration level
    }, []);

    // Calculate position on arc
    const calculateArcPosition = (angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
            x: CENTER_X + ARC_RADIUS * Math.cos(radians),
            y: CENTER_Y + ARC_RADIUS * Math.sin(radians)
        };
    };

    // Handle alignment logic
    useEffect(() => {
        let interval;

        if (isAligned) {
            if (!alignmentStartTime) {
                setAlignmentStartTime(Date.now());
            }

            interval = setInterval(() => {
                const elapsedTime = (Date.now() - alignmentStartTime) / 1000;
                const newConcentrationLevel = Math.min(elapsedTime / 3 * 100, 100); // Max at 100%
                setConcentrationLevel(newConcentrationLevel);

                if (elapsedTime >= 3) {
                    setScore((prev) => prev + 1);
                    generateNewTarget();
                }
            }, 100);
        } else {
            setAlignmentStartTime(null);
            setConcentrationLevel(0);
        }

        return () => clearInterval(interval);
    }, [isAligned, alignmentStartTime, generateNewTarget]);

    // Update player position based on pitch
    tilt.useTilt((newPitch) => {
        setPitchValue(newPitch);
        const newPosition = pitchToPosition(newPitch);
        setPlayerPosition(newPosition);

        // Check alignment
        const isNowAligned = Math.abs(newPosition - targetPosition) < ALIGNMENT_THRESHOLD;
        setIsAligned(isNowAligned);
    });

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
                        r={10 + (concentrationLevel / 10)} // Radius grows with concentration
                        fill={`rgba(72, 187, 120, ${0.4 + concentrationLevel / 100})`} // Darker with concentration
                    />
                </svg>
            </div>

            <div className="mt-8 space-y-4 text-center">
                <p className="text-2xl font-bold">Score: {score}</p>
                <p className="text-lg">
                    {isAligned
                        ? `Concentration: ${Math.floor(concentrationLevel)}%`
                        : "Align the circles by tilting your head"}
                </p>
                <button
                    onClick={() => isAligned && setScore((prev) => prev + 1)}
                    className={`py-2 px-4 rounded ${
                        isAligned ? "bg-green-500 hover:bg-green-700" : "bg-gray-400"
                    } text-white mr-4`}
                    disabled={!isAligned}
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
