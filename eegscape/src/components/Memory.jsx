import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import { useNavigate } from "react-router";
import useLocalStorage from "use-local-storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBrain, faEye, faRepeat } from "@fortawesome/free-solid-svg-icons";
import nodLeft from "./../assets/nodLeft.png";
import nodLeftWhite from "./../assets/nodLeft-white.png";
import useSound from "use-sound";

import nodRight from "./../assets/nodRight.png";
import nodBottom from "./../assets/nodDown.png";
import flowerSound from "./../assets/sounds/bees.mp3";
import failSound from "./../assets/sounds/fail.mp3";
import birdsSound from "./../assets/sounds/birds-chirping.mp3";
import fireworksSound from "./../assets/sounds/fireworks-whistle.mp3";

const Memory = ({ setActiveComponent }) => {
  // Game states
  const [sequence, setSequence] = useState([]);
  const [playerSequence, setPlayerSequence] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  const { nod } = useReceiveEeg();
  const navigate = useNavigate();
  const [highScore, setHighScore] = useLocalStorage(
    "eegscape:memory-high-score",
    0
  );
  const [isPlayerSequenceCorrect, setIsPlayerSequenceCorrect] =
    useState(undefined);

  const [playFlowerSound] = useSound(flowerSound);
  const [playFailSound] = useSound(failSound);
  const [playBirdsSound] = useSound(birdsSound);
  const [playFireworksSound] = useSound(fireworksSound);

  // Constants
  const BUTTONS = [
    {
      id: 1,
      // color: "bg-red-500",
      // activeColor: "bg-red-500",
      activeGlowColor: "shadow-primary",
      activeGlow: "shadow-xl",
      starterText: "Nod left",
      starterIcon: nodLeft,
      icon: "🌹",
      sound: playFlowerSound,
    },
    {
      id: 2,
      // color: "bg-blue-500",
      // activeColor: "bg-blue-500",
      activeGlowColor: "shadow-primary",
      activeGlow: "shadow-xl",
      starterText: "Nod bottom",
      starterIcon: nodBottom,
      icon: "🐦",
      sound: playBirdsSound,
    },
    {
      id: 3,
      // color: "bg-green-500",
      // activeColor: "bg-green-500",
      activeGlowColor: "shadow-primary",
      activeGlow: "shadow-xl",
      starterText: "Nod right",
      starterIcon: nodRight,
      icon: "🎆",
      sound: playFireworksSound,
    },
  ];
  const FLASH_DURATION = 500;
  const SEQUENCE_INTERVAL = 1000;
  const BUTTON_ACTIVE_DURATION = 500;

  // Generate next sequence by adding a random button
  const generateNextSequence = useCallback(() => {
    const nextButton = Math.floor(Math.random() * 3) + 1;
    setSequence((prev) => [...prev, nextButton]);
  }, []);

  // Show sequence to player
  const showSequence = useCallback(async () => {
    setIsShowingSequence(true);

    for (let i = 0; i < sequence.length; i++) {
      const buttonElement = document.getElementById(`button-${sequence[i]}`);
      await new Promise((resolve) => setTimeout(resolve, SEQUENCE_INTERVAL));
      const button = BUTTONS[sequence[i] - 1];
      // button.classList.remove(button.color);
      // button.classList.add(button.activeColor);
      buttonElement.classList.add(button.activeGlow);
      buttonElement.classList.add(button.activeGlowColor);
      buttonElement.innerHTML = button.icon;

      await new Promise((resolve) => setTimeout(resolve, FLASH_DURATION));
      // button.classList.remove(button.activeColor);
      buttonElement.classList.remove(button.activeGlow);
      buttonElement.classList.remove(button.activeGlowColor);
      // button.classList.add(button.color);
      button.sound();
      buttonElement.innerHTML = "";
    }

    setIsShowingSequence(false);
  }, [sequence]);

  // Handle button activation (for both clicks and EEG)
  const handleButtonActivation = useCallback(
    (buttonId) => {
      if (isShowingSequence || !isPlaying) return;

      // Visual feedback
      const button = BUTTONS.find(({ id }) => id === buttonId);
      setTimeout(() => setActiveButton(null), BUTTON_ACTIVE_DURATION);

      const newPlayerSequence = [...playerSequence, buttonId];
      setPlayerSequence(newPlayerSequence);

      // Check if the player's sequence matches so far
      const isCorrect = newPlayerSequence.every(
        (button, index) => button === sequence[index]
      );

      if (!isCorrect) {
        setGameOver(true);
        setIsPlaying(false);
        playFailSound();
        return;
      } else {
        button.sound();
        setActiveButton(buttonId);
      }

      // If player completed the sequence correctly
      if (newPlayerSequence.length === sequence.length) {
        setIsPlayerSequenceCorrect(true);
        setScore((prev) => {
          const result = prev + 1;
          if (result > highScore) {
            setHighScore(result);
          }
          return result;
        });
        setPlayerSequence([]);
        setTimeout(() => {
          generateNextSequence();
          setIsPlayerSequenceCorrect(undefined);
        }, SEQUENCE_INTERVAL);
      }
    },
    [
      isShowingSequence,
      isPlaying,
      playerSequence,
      sequence,
      generateNextSequence,
    ]
  );

  // Start new game
  const startGame = useCallback(() => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    generateNextSequence();
  }, [generateNextSequence]);

  // EEG nod handlers for gameplay
  nod.useNodLeft(() => {
    if (isPlaying) {
      handleButtonActivation(1);
    } else if (gameOver) {
      // Check for left-right head shake pattern to return to menu
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    } else {
      // Start game with any nod when not playing
      startGame();
    }
  });

  nod.useNodBottom(() => {
    if (isPlaying) {
      handleButtonActivation(2);
    } else if (gameOver) {
      // Restart game with downward nod
      startGame();
    } else {
      // Start game with any nod when not playing
      startGame();
    }
  });

  nod.useNodRight(() => {
    if (isPlaying) {
      handleButtonActivation(3);
    } else if (gameOver) {
      // Check for left-right head shake pattern to return to menu
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    } else {
      // Start game with any nod when not playing
      startGame();
    }
  });

  // Show sequence whenever it changes
  useEffect(() => {
    if (sequence.length > 0 && isPlaying) {
      showSequence();
    }
  }, [sequence, isPlaying, showSequence]);

  return (
    <div className="flex flex-col items-center gap-4 p-8 max-w-md mx-auto rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold flex gap-2 justify-center items-center">
        <FontAwesomeIcon icon={faBrain} />
        Memory Game
      </h1>
      {!isPlaying && !gameOver && (
        <p>To tap ☝️ each button when you repeat the sequence,</p>
      )}
      <div className="flex justify-center gap-4">
        {BUTTONS.map(
          ({
            id,
            activeGlow,
            activeGlowColor,
            icon,
            starterText,
            starterIcon,
          }) => (
            <button
              key={id}
              id={`button-${id}`}
              onClick={() => handleButtonActivation(id)}
              disabled={!isPlaying || isShowingSequence}
              className={`w-36 h-36 rounded-full
            border-none flex flex-col justify-center items-center
                            transition-colors duration-200 bg-primary text-primary-content
                            ${!isPlaying || gameOver ? "text-lg" : "text-4xl"}
                            ${
                              activeButton === id
                                ? `${activeGlowColor} ${activeGlow}`
                                : ""
                            }`}
            >
              {!isPlaying && !gameOver ? (
                <>
                  <img src={starterIcon} className="w-16 h-16" />
                  <span className="font-bold w-24 -mt-2">{starterText}</span>
                </>
              ) : (
                activeButton === id && <span>{icon}</span>
              )}
            </button>
          )
        )}
      </div>
      <div className="flex flex-col items-start w-full">
        {gameOver && (
          <p className="text-error text-lg self-center font-bold">
            You forgot the sequence 😵‍💫
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
                  onClick={() => navigate("/")}
                >
                  <img className="w-16 h-16" src={nodLeftWhite} />
                  Shake your head left or right to return to the menu.
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div className="w-full flex flex-col font-bold text-lg gap-2">
        <div className="w-full flex items-start justify-start gap-2 bg-secondary text-secondary-content px-4 py-1 rounded-md">
          <span>Length of your sequence</span>
          <div className="flex-grow"></div>
          <span>{score}</span>
        </div>
        <div className="w-full flex items-start justify-start gap-2 bg-secondary text-secondary-content px-4 py-1 rounded-md">
          <span>Length of your longest sequence</span>
          <div className="flex-grow"></div>
          <span>{highScore}</span>
        </div>
      </div>

      <div className="text-lg">
        {isPlaying && !gameOver && (
          <p className="text-lg font-bold flex gap-2 justify-center items-center">
            {isShowingSequence && <FontAwesomeIcon icon={faEye} />}
            {!isShowingSequence && <FontAwesomeIcon icon={faRepeat} />}

            <span>
              {isShowingSequence
                ? "Watch the sequence..."
                : isPlayerSequenceCorrect
                ? "You remembered! 😃"
                : "Your turn! Repeat the sequence"}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Memory;
