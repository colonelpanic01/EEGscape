import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import useLocalStorage from "use-local-storage";
import nodLeftWhite from "./../assets/nodLeft-white.png";

const ALIGNMENT_AND_FOCUS_TIME = 3000;
const ALIGNMENT_AND_FOCUS_TIME_INCREMENT = 200;

const GyroFocus = ({ setActiveComponent }) => {
  const { tilt, nod, concentration } = useReceiveEeg();
  const [pitchValue, setPitchValue] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(0);
  const [targetPosition, setTargetPosition] = useState(45);
  const [score, setScore] = useState(0);
  const [isAligned, setIsAligned] = useState(false);
  const [alignmentStartTime, setAlignmentStartTime] = useState(null);
  const [highScore, setHighScore] = useLocalStorage(
    "eegscape:gyrofocus-high-score",
    0
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [concentrationLevel, setConcentrationLevel] = useState(0);
  const [timeLeft, setTimeLeft] = useState(2); // Timer in seconds
  const [gameOver, setGameOver] = useState(false);
  const [isFocused, setIsFocused] = useState(0);

  const ALIGNMENT_THRESHOLD = 7;
  const ARC_RADIUS = 150;
  const CENTER_X = 200;
  const CENTER_Y = 200;

  const pitchToPosition = useCallback((pitch) => {
    const clampedPitch = Math.max(-90, Math.min(90, pitch));
    return clampedPitch;
  }, []);

  const generateNewTarget = useCallback(() => {
    setScore((prev) => prev + 1);
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

  function startGame() {
    setGameOver(false);
    generateNewTarget();
  }

  useEffect(() => {
    setIsPlaying(!gameOver);

    return () => {};
  }, [gameOver]);

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      //   const timer = setInterval(() => {
      //     setTimeLeft((prev) => prev - 1);
      //   }, 1000);
      //   return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setGameOver(true);
    }
  }, [timeLeft, gameOver]);

  tilt.useTilt((newPitch) => {
    if (!gameOver) {
      setPitchValue(newPitch);
      const newPosition = pitchToPosition(newPitch);
      setPlayerPosition(newPosition);

      const isNowAligned =
        Math.abs(newPosition - targetPosition) < ALIGNMENT_THRESHOLD;
      setIsAligned(isNowAligned);
    }
  });

  // Restart or go back to menu using nods
  nod.useNodBottom(() => {
    if (gameOver) {
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
    setIsFocused(true);
  });

  concentration.useRelax(() => {
    setIsFocused(false);
  });

  useEffect(() => {
    if (!isFocused || !isAligned) {
      return;
    }
    const timeout = setTimeout(() => {
      generateNewTarget();
    }, ALIGNMENT_AND_FOCUS_TIME);

    const increment =
      (ALIGNMENT_AND_FOCUS_TIME_INCREMENT / ALIGNMENT_AND_FOCUS_TIME) * 100;

    const interval = setInterval(() => {
      setConcentrationLevel((prev) => {
        const result = prev + increment;
        return Math.min(100, result);
      });
    }, ALIGNMENT_AND_FOCUS_TIME_INCREMENT);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
      setConcentrationLevel(0);
    };
  }, [isFocused, isAligned]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center h-screen">
      <div className="relative w-[400px] h-[400px] flex justify-center items-center">
        <svg
          className="absolute"
          width="400"
          height="400"
          viewBox="0 0 400 400"
        >
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
            fill="#e779c1"
          />
          <circle
            cx={calculateArcPosition(playerPosition).x}
            cy={calculateArcPosition(playerPosition).y}
            r={15 + concentrationLevel / 10}
            fill={`rgba(255, 210, 0, ${0.4 + concentrationLevel / 100})`}
          />
        </svg>
      </div>

      <div className="flex flex-col items-start w-full">
        {gameOver && (
          <p className="text-error text-lg self-center font-bold">
            {"Time's up! ⏰"}
          </p>
        )}
        {!isPlaying && (
          <>
            {!gameOver && (
              <button
                onClick={startGame}
                className="flex items-center justify-start gap-4 w-full pr-2"
              >
                <img
                  src="https://img.icons8.com/?size=100&id=BGQDUMFak9MT&format=png&color=ffffff"
                  className="w-10 h-10"
                ></img>
                <span>Nod down to start the game.</span>
              </button>
            )}
            {gameOver && (
              <>
                <button
                  onClick={startGame}
                  className="flex items-center justify-start gap-4 w-full pr-2"
                >
                  <img
                    src="https://img.icons8.com/?size=100&id=BGQDUMFak9MT&format=png&color=ffffff"
                    className="w-10 h-10 ml-4"
                  ></img>
                  <span>Nod down to play again.</span>
                </button>
                <button
                  className="flex items-center justify-center gap-2 text-left w-full pr-2"
                  onClick={() => setActiveComponent("menu")}
                >
                  <img className="w-16 h-16" src={nodLeftWhite} />
                  Shake your head left or right to return to the menu.
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-8 space-y-4 text-center">
        {!gameOver ? (
          <>
            <p className="text-lg text-white">
              {isAligned
                ? `Concentration: ${Math.floor(concentrationLevel)}%`
                : "Align the circles by tilting your head"}
            </p>
            <p className="text-lg text-white">Time Left: {timeLeft}s</p>
          </>
        ) : (
          <></>
        )}
      </div>

      <div className="w-full flex flex-col font-bold text-lg gap-2">
        <div className="w-full flex items-start justify-start gap-2 bg-secondary text-secondary-content px-4 py-1 rounded-md">
          <span>Concentration check passed.</span>
          <div className="flex-grow"></div>
          <span>{score}</span>
        </div>
        <div className="w-full flex items-start justify-start gap-2 bg-secondary text-secondary-content px-4 py-1 rounded-md">
          <span>Most concentration check passed.</span>
          <div className="flex-grow"></div>
          <span>{highScore}</span>
        </div>
      </div>
    </div>
  );
};

export default GyroFocus;
