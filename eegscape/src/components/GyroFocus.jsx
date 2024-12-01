import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const GyroFocus = ({ setActiveComponent }) => {
    const { tilt, nod, concentration } = useReceiveEeg();
    const [pitchValue, setPitchValue] = useState(null);
    const [playerPosition, setPlayerPosition] = useState(0);
    const [targetPosition, setTargetPosition] = useState(45);
    const [score, setScore] = useState(0);
    const [isAligned, setIsAligned] = useState(false);
    const [alignmentStartTime, setAlignmentStartTime] = useState(null);
    const [concentrationLevel, setConcentrationLevel] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60); // Timer in seconds
    const [gameOver, setGameOver] = useState(false);

    const ALIGNMENT_THRESHOLD = 7;
    const ARC_RADIUS = 150;
    const CENTER_X = 200;
    const CENTER_Y = 200;
    const count = 0;

    const pitchToPosition = useCallback((pitch) => {
        const clampedPitch = Math.max(-90, Math.min(90, pitch));
        return clampedPitch;
    }, []);

    const generateNewTarget = useCallback(() => {
        const newPosition = Math.random() * 180 - 90;
        setTargetPosition(newPosition);
        setIsAligned(false);
        setConcentrationLevel(0);
    }, []);

    const calculateArcPosition = (angle) => {
        const radians = (angle - 90) * (Math.PI / 180);
        return {
            x: CENTER_X + ARC_RADIUS * Math.cos(radians),
            y: CENTER_Y + ARC_RADIUS * Math.sin(radians),
        };
    };

    // useEffect(() => {
    //     let interval;

    //     if (isAligned) {
    //         if (!alignmentStartTime) {
    //             setAlignmentStartTime(Date.now());
    //         }

    //         interval = setInterval(() => {
    //             setConcentrationLevel(newConcentrationLevel);

    //             if (elapsedTime >= 3) {
    //                 setScore((prev) => prev + 1);
    //                 generateNewTarget();
    //             }
    //         }, 100);
    //     } else {
    //         setAlignmentStartTime(null);
    //         setConcentrationLevel(0);
    //     }

    //     return () => clearInterval(interval);
    // }, [isAligned, alignmentStartTime, generateNewTarget]);

    useEffect(() => {
        if (timeLeft > 0 && !gameOver) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            setGameOver(true);
        }
    }, [timeLeft, gameOver]);

    tilt.useTilt((newPitch) => {
        setPitchValue(newPitch);
        const newPosition = pitchToPosition(newPitch);
        setPlayerPosition(newPosition);

        const isNowAligned = Math.abs(newPosition - targetPosition) < ALIGNMENT_THRESHOLD;
        setIsAligned(isNowAligned);
    });

    // Restart or go back to menu using nods
    nod.useNodBottom(() => {
        if (gameOver) {
            count = 0;
            setScore(0);
            setTimeLeft(60);
            setGameOver(false);
            generateNewTarget();
        }
    });

    nod.useNodLeft(() => {
        if (gameOver) {
            setActiveComponent("menu");
        }
    });

    nod.useNodRight(() => {
        if (gameOver) {
            setActiveComponent("menu");
        }
    });
    
    concentration.useFocus(() => {
        console.log("concentration");
        
    });
    

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <div className="relative w-[400px] h-[400px] flex justify-center items-center">
                <svg className="absolute" width="400" height="400" viewBox="0 0 400 400">
                    <path
                        d="M 50 200 A 150 150 0 0 1 350 200"
                        fill="none"
                        stroke="#CBD5E0"
                        strokeWidth="4"
                    />
                    <circle
                        cx={calculateArcPosition(targetPosition).x}
                        cy={calculateArcPosition(targetPosition).y}
                        r="20"
                        fill="#F56565"
                    />
                    <circle
                        cx={calculateArcPosition(playerPosition).x}
                        cy={calculateArcPosition(playerPosition).y}
                        r={15 + concentrationLevel / 10}
                        fill={`rgba(72, 187, 120, ${0.4 + concentrationLevel / 100})`}
                    />
                </svg>
            </div>

            <div className="mt-8 space-y-4 text-center">
                {!gameOver ? (
                    <>
                        <p className="text-2xl text-gray-700 font-bold">Score: {score}</p>
                        <p className="text-lg text-gray-600">
                            {isAligned
                                ? `Concentration: ${Math.floor(concentrationLevel)}%`
                                : "Align the circles by tilting your head"}
                        </p>
                        <p className="text-lg text-gray-600">Time Left: {timeLeft}s</p>
                    </>
                ) : (
                    <>
                        <p className="text-2xl text-red-600 font-bold">Game Over!</p>
                        <p className="text-lg text-gray-700">Final Score: {score}</p>
                        <p className="text-lg text-gray-600">
                            Nod down to play again or left/right to return to the menu.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default GyroFocus;
