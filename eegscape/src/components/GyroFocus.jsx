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
    const [concentrationLevel, setConcentrationLevel] = useState(0);

    // Constants for game mechanics
    const ALIGNMENT_THRESHOLD = 7;
    const ARC_RADIUS = 150; // Increased for a larger display
    const CENTER_X = 200;   // Adjusted to match increased size
    const CENTER_Y = 200;

    // Convert pitch to position on arc (assuming pitch ranges from -90 to 90)
    const pitchToPosition = useCallback((pitch) => {
        const clampedPitch = Math.max(-90, Math.min(90, pitch));
        return clampedPitch;
    }, []);

    // Generate random position on arc
    const generateNewTarget = useCallback(() => {
        const newPosition = Math.random() * 180 - 90;
        setTargetPosition(newPosition);
        setIsAligned(false);
        setConcentrationLevel(0);
    }, []);

    // Calculate position on arc
    const calculateArcPosition = (angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
            x: CENTER_X + ARC_RADIUS * Math.cos(radians),
            y: CENTER_Y + ARC_RADIUS * Math.sin(radians),
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
                const newConcentrationLevel = Math.min((elapsedTime / 3) * 100, 100);
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
            <div className="relative w-[400px] h-[400px] flex justify-center items-center">
                {/* Background Arc */}
                <svg className="absolute" width="400" height="400" viewBox="0 0 400 400">
                    <path
                        d="M 50 200 A 150 150 0 0 1 350 200"
                        fill="none"
                        stroke="#CBD5E0"
                        strokeWidth="4"
                    />

                    {/* Target Circle */}
                    <circle
                        cx={calculateArcPosition(targetPosition).x}
                        cy={calculateArcPosition(targetPosition).y}
                        r="20"
                        fill="#F56565"
                    />

                    {/* Player Circle */}
                    <circle
                        cx={calculateArcPosition(playerPosition).x}
                        cy={calculateArcPosition(playerPosition).y}
                        r={15 + concentrationLevel / 10}
                        fill={`rgba(72, 187, 120, ${0.4 + concentrationLevel / 100})`}
                    />
                </svg>
            </div>

            <div className="mt-8 space-y-4 text-center">
                <p className="text-2xl text-gray-700 font-bold">Score: {score}</p>
                <p className="text-lg text-gray-600">
                    {isAligned
                        ? `Concentration: ${Math.floor(concentrationLevel)}%`
                        : "Align the circles by tilting your head"}
                </p>

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
