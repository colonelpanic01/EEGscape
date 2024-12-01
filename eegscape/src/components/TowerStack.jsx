import { useEffect, useRef, useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import { useNavigate } from "react-router";
import useLocalStorage from "use-local-storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGopuram } from "@fortawesome/free-solid-svg-icons";
import { faEye } from "@fortawesome/free-regular-svg-icons";
import nodLeft from "./../assets/nodLeft-white.png";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 100;
const SPEED_INCREMENT = 0.1;
const STACK_HEIGHT_TO_OFFSET_THRESHOLD = 4;
const INITIAL_SPEED_MULTIPLIER = 4;
const FALLING_DURATION = 1000;

const DEFAULT_CURRENT_BLOCK = {
  width: DEFAULT_WIDTH,
  position: 0,
  direction: 1,
};

const DEFAULT_FALLING_BLOCK = {
  width: DEFAULT_WIDTH,
  position: 0,
};

const TowerStack = ({ setActiveComponent }) => {
  const [blocks, setBlocks] = useState([{ width: DEFAULT_WIDTH, position: 0 }]);
  const [highScore, setHighScore] = useLocalStorage(
    "eegscape:tower-stack-high-score",
    1
  );
  const [currentBlock, setCurrentBlock] = useState(DEFAULT_CURRENT_BLOCK);
  const [fallingBlock, setFallingBlock] = useState(DEFAULT_FALLING_BLOCK);
  const [stackHeight, setStackHeight] = useState(1);
  const [heightOffset, setHeightOffset] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(
    INITIAL_SPEED_MULTIPLIER
  );
  const [gameOver, setGameOver] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const { nod, blink } = useReceiveEeg();
  const navigate = useNavigate();

  const gameRef = useRef(null);

  useEffect(() => {
    setHeightOffset((prev) =>
      stackHeight < STACK_HEIGHT_TO_OFFSET_THRESHOLD
        ? prev
        : prev + DEFAULT_HEIGHT
    );
  }, [stackHeight]);

  // EEG nod handlers for gameplay
  nod.useNodLeft(() => {
    if (gameOver) {
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    }
  });

  nod.useNodBottom(() => {
    if (gameOver) {
      handlePlayAgain();
    }
  });

  nod.useNodRight(() => {
    if (gameOver) {
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    }
  });

  useEffect(() => {
    if (gameOver) return;

    if (isFalling) return;

    const interval = setInterval(() => {
      setCurrentBlock((prev) => {
        let newPosition = prev.position + prev.direction * speedMultiplier;
        const containerWidth = gameRef.current?.offsetWidth || 400;
        console.table({
          newPosition,
          containerWidth,
        });
        if (
          newPosition <= -containerWidth / 2 ||
          newPosition + prev.width >= containerWidth / 2
        ) {
          return { ...prev, direction: -prev.direction };
        }
        return { ...prev, position: newPosition };
      });
    }, 16);

    return () => clearInterval(interval);
  }, [gameOver, speedMultiplier, isFalling]);

  const handleBlockDrop = () => {
    if (gameOver) return;
    const lastBlock = blocks[blocks.length - 1];

    // Adjust positions to account for different reference frames
    const lastBlockAdjustedPosition = lastBlock.position - lastBlock.width / 2;
    const currentBlockAdjustedPosition = currentBlock.position;

    // Calculate left and right edges for both blocks
    const lastBlockLeft = lastBlockAdjustedPosition;
    const lastBlockRight = lastBlockAdjustedPosition + lastBlock.width;
    const currentBlockLeft = currentBlockAdjustedPosition;
    const currentBlockRight = currentBlockAdjustedPosition + currentBlock.width;

    // Calculate overlap
    const overlap =
      Math.min(lastBlockRight, currentBlockRight) -
      Math.max(lastBlockLeft, currentBlockLeft);

    console.log(overlap);

    if (overlap <= 0) {
      setGameOver(true);
      return;
    }

    const newBlockWidth = overlap;
    const newBlockPosition =
      Math.max(lastBlockLeft, currentBlockLeft) + newBlockWidth / 2;

    setFallingBlock({
      width: currentBlock.width,
      position: currentBlockAdjustedPosition,
    });

    setSpeedMultiplier((prev) => prev + SPEED_INCREMENT);
    setIsFalling(true);

    setTimeout(() => {
      setBlocks((prev) => [
        ...prev,
        { width: newBlockWidth, position: newBlockPosition },
      ]);
      setStackHeight((prev) => {
        const result = prev + 1;
        if (result > highScore) {
          setHighScore(result);
        }
        return result;
      });

      setCurrentBlock({
        width: newBlockWidth,
        position: 0,
        direction: 1,
      });
      setIsFalling(false);
    }, FALLING_DURATION);
  };

  function handlePlayAgain() {
    setGameOver(false);
    setBlocks([DEFAULT_CURRENT_BLOCK]);
    setCurrentBlock(DEFAULT_CURRENT_BLOCK);
    setFallingBlock(DEFAULT_FALLING_BLOCK);
    setStackHeight(1);
    setHeightOffset(0);
  }

  nod.useNodBottom(() => {
    if (!gameOver) {
      // handleBlockDrop();
    } else {
      handlePlayAgain();
    }
  });

  blink.useBlink(() => {
    console.log("Blink RECEIEVD");
    if (!gameOver) {
      handleBlockDrop();
    }
  });

  nod.useNodLeft(() => {
    if (!gameOver) {
      return;
    } else {
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    }
  });

  nod.useNodRight(() => {
    if (!gameOver) {
      return;
    } else {
      const handleMenuReturn = () => {
        if (setActiveComponent) {
          setActiveComponent("menu");
        }
      };
      handleMenuReturn();
    }
  });

  return (
    <div
      className="w-full h-full flex flex-col justify-center items-end outline-none focus:outline-none"
      onKeyDown={(e) => e.key === " " && handleBlockDrop()}
      tabIndex={0}
    >
      <div className="flex flex-col w-full h-full gap-4">
        <h1 className="text-2xl font-bold flex gap-2 justify-center items-center">
          <FontAwesomeIcon icon={faGopuram} />
          Tower Stack
        </h1>
        {gameOver ? (
          <div className="flex flex-row gap-2 items-center justify-center">
            <button
              onClick={handlePlayAgain}
              className={`flex items-center justify-end gap-4 self-center ${
                gameOver ? "" : "invisible"
              } w-72 pr-4`}
            >
              <img
                src="https://img.icons8.com/?size=100&id=BGQDUMFak9MT&format=png&color=ffffff"
                className="w-10 h-10"
              ></img>
              <span>Nod to play again.</span>
            </button>
            <span className="font-bold">or</span>
            <button
              onClick={() => {
                console.log(setActiveComponent);
                if (setActiveComponent) {
                  setActiveComponent("menu");
                }
              }}
              className="flex items-center justify-center gap-2 text-left w-72"
            >
              <img className="w-16 h-16" src={nodLeft} />
              Shake your head left or right to return to the menu.
            </button>
          </div>
        ) : (
          <button
            className={`flex items-center justify-start gap-4 self-center`}
          >
            <FontAwesomeIcon icon={faEye} className="text-2xl" />
            <span>Blink to drop the moving tower block.</span>
          </button>
        )}
        <div className="flex flex-row w-full h-fit">
          <div
            ref={gameRef}
            className="relative w-full flex flex-col h-[600px] overflow-hidden"
          >
            {blocks.map((block, index) => {
              return (
                <div
                  key={index}
                  className="absolute bg-primary text-primary-content flex flex-col items-center justify-center font-bold text-2xl"
                  style={{
                    left: `50%`,
                    transform: `translate(calc(${block.position}px - 50%), ${heightOffset}px)`,
                    bottom: index * DEFAULT_HEIGHT,
                    width: `${block.width}px`,
                    height: `${DEFAULT_HEIGHT}px`,
                  }}
                >
                  {index === blocks.length - 1 && <span>{stackHeight}</span>}
                  {gameOver && index === blocks.length - 1 && (
                    <p className="text-error font-bold text-lg absolute bottom-full">
                      You missed the tower entirely 😔
                    </p>
                  )}
                </div>
              );
            })}
            {/* The falling block */}
            {!gameOver && (
              <div
                className={`absolute bg-accent ${
                  isFalling ? "" : "invisible transition-transform"
                }`}
                style={{
                  transitionDuration: FALLING_DURATION,
                  bottom: (blocks.length + 1) * DEFAULT_HEIGHT,
                  left: "50%",
                  transform: `translate(calc(${fallingBlock.position}px), ${
                    heightOffset + (isFalling ? DEFAULT_HEIGHT : 0)
                  }px)`,
                  width: `${fallingBlock.width}px`,
                  height: `${DEFAULT_HEIGHT}px`,
                }}
              ></div>
            )}
            {/* The moving block */}
            {!gameOver && !isFalling && (
              <div
                className="absolute bg-accent"
                style={{
                  bottom: (blocks.length + 1) * DEFAULT_HEIGHT,
                  left: "50%",
                  transform: `translate(calc(${currentBlock.position}px), ${heightOffset}px)`,
                  width: `${currentBlock.width}px`,
                  height: `${DEFAULT_HEIGHT}px`,
                }}
              ></div>
            )}
          </div>
          <div className="flex gap-4 self-stretch p-2 text-lg font-bold">
            {/* <div className="h-full flex flex-col w-24 bg-primary text-primary-content px-4 py-4 rounded-md">
              <span>{stackHeight}</span>
              <div className="flex-grow"></div>
              <span>Tower height</span>
            </div> */}
            <div className="h-full flex flex-col w-24 bg-secondary text-secondary-content px-4 py-4 rounded-md">
              <span>{highScore}</span>
              <div className="flex-grow"></div>
              <span>Tallest Tower Height</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TowerStack;
