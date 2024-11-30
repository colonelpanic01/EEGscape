import { useEffect, useRef, useState } from "react";

const DEFAULT_WIDTH = 120;
const DEFAULT_HEIGHT = 120;
const SPEED_INCREMENT = 0.1;
const STACK_HEIGHT_TO_OFFSET_THRESHOLD = 3;

const TowerStackCore = () => {
  const [blocks, setBlocks] = useState([{ width: DEFAULT_WIDTH, position: 0 }]);
  const [currentBlock, setCurrentBlock] = useState({
    width: DEFAULT_WIDTH,
    position: 0,
    direction: 1,
  });
  const [stackHeight, setStackHeight] = useState(0);
  const [heightOffset, setHeightOffset] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(3);
  const [gameOver, setGameOver] = useState(false);

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

    const interval = setInterval(() => {
      setCurrentBlock((prev) => {
        let newPosition = prev.position + prev.direction * speedMultiplier;
        const containerWidth = gameRef.current?.offsetWidth || 400;
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
  }, [gameOver, speedMultiplier]);

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

    setBlocks((prev) => [
      ...prev,
      { width: newBlockWidth, position: newBlockPosition },
    ]);
    setStackHeight((prev) => prev + 1);

    setCurrentBlock({
      width: newBlockWidth,
      position: 0,
      direction: 1,
    });

    setSpeedMultiplier((prev) => prev + SPEED_INCREMENT);
  };

  return (
    <div
      className="w-full h-full flex justify-center items-end"
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

        {!gameOver && (
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
          <div className="absolute inset-0 bg-red-500 bg-opacity-50 flex justify-center items-center">
            <h1 className="text-2xl font-bold text-white">Game Over</h1>
          </div>
        )}
      </div>
    </div>
  );
};

export default TowerStackCore;
