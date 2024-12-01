import { useEffect, useRef, useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import { useNavigate } from "react-router";
import useLocalStorage from "use-local-storage";

const DEFAULT_WIDTH = 200;
const DEFAULT_HEIGHT = 100;
const SPEED_INCREMENT = 0.1;
const STACK_HEIGHT_TO_OFFSET_THRESHOLD = 3;
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

const TowerStack = () => {
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
  const { nod } = useReceiveEeg();
  const navigate = useNavigate();

  const gameRef = useRef(null);

  useEffect(() => {
    setHeightOffset((prev) =>
      stackHeight < STACK_HEIGHT_TO_OFFSET_THRESHOLD
        ? prev
        : prev + DEFAULT_HEIGHT
    );
  }, [stackHeight]);

  useEffect(() => {
    if (gameOver) return;

    if (isFalling) return;

    const interval = setInterval(() => {
      setCurrentBlock((prev) => {
        let newPosition = prev.position + prev.direction * speedMultiplier;
        const containerWidth = gameRef.current?.offsetWidth || 400;
        if (
          newPosition <= -containerWidth / 3 ||
          newPosition + prev.width >= containerWidth / 3
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
    setStackHeight(0);
    setHeightOffset(0);
  }

  nod.useNodBottom(() => {
    if (!gameOver) {
      handleBlockDrop();
    }
    else {
      handlePlayAgain();
    }
  });

  nod.useNodLeft(() => {
    if (!gameOver) {
      return;
    }
    else {
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
    }
    else {
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
      className="w-full h-full flex flex-col justify-center items-end"
      onKeyDown={(e) => e.key === " " && handleBlockDrop()}
      tabIndex={0}
    >
      <div ref={gameRef} className="relative w-full h-[600px] overflow-hidden">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="absolute bg-blue-500"
            style={{
              left: `50%`,
              transform: `translate(calc(${block.position}px - 50%), ${heightOffset}px)`,
              bottom: index * DEFAULT_HEIGHT,
              width: `${block.width}px`,
              height: `${DEFAULT_HEIGHT}px`,
            }}
          ></div>
        ))}
        {/* The falling block */}
        {!gameOver && (
          <div
            className={`absolute bg-green-500 ${isFalling ? "" : "invisible transition-transform"
              }`}
            style={{
              transitionDuration: FALLING_DURATION,
              bottom: (blocks.length + 1) * DEFAULT_HEIGHT,
              left: "50%",
              transform: `translate(calc(${fallingBlock.position}px), ${heightOffset + (isFalling ? DEFAULT_HEIGHT : 0)
                }px)`,
              width: `${fallingBlock.width}px`,
              height: `${DEFAULT_HEIGHT}px`,
            }}
          ></div>
        )}
        {/* The moving block */}
        {!gameOver && !isFalling && (
          <div
            className="absolute bg-green-500"
            style={{
              bottom: (blocks.length + 1) * DEFAULT_HEIGHT,
              left: "50%",
              transform: `translate(calc(${currentBlock.position}px), ${heightOffset}px)`,
              width: `${currentBlock.width}px`,
              height: `${DEFAULT_HEIGHT}px`,
            }}
          ></div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex flex-col gap-2 justify-center items-center">
            <h1 className="text-2xl font-bold text-white">Game Over</h1>
            <p>Nod left or right to go back to home. Nod down to play again.</p>
            <button className="btn" onClick={handlePlayAgain}>
              Play Again
            </button>
          </div>
        )}
      </div>
      <div className="self-center flex gap-4 p-2">
        <p>
          Tower height: {stackHeight} block{stackHeight > 1 ? "s" : ""}
        </p>
        <p>
          Tallest tower: {highScore} block{highScore > 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
};

export default TowerStack;
