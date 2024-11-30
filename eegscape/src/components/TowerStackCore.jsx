import { useEffect, useRef, useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const defaultBlockXPercent = {
  withinCenter: 100,
  fromCenter: 100,
};

const DEFAULT_BLOCK_WIDTH = 80;

function blockGenerator(
  isFromLeft,
  leftTranslate,
  blockWidth,
  prevBlock,
  targetBlockWidth,
  id
) {
  console.table({
    isFromLeft,
    leftTranslate,
    blockWidth,
    prevBlock,
    targetBlockWidth,
    id,
  });

  let leftEdge = isFromLeft ? leftTranslate : 100 - leftTranslate;
  let rightEdge = (blockWidth / targetBlockWidth) * 100 + leftTranslate;

  console.table({
    leftEdgeInit: leftEdge,
    rightEdgeInit: rightEdge,
  });

  const { leftEdgePrev, rightEdgePrev, widthPrev } = prevBlock;

  leftEdge = Math.max(leftEdge, leftEdgePrev);
  rightEdge = Math.min(rightEdge, rightEdgePrev);
  const width = ((rightEdgePrev - leftEdgePrev) / 100) * targetBlockWidth;

  console.table({
    leftEdge,
    rightEdge,
    width,
  });

  return {
    leftEdge,
    rightEdge,
    width,
    id,
  };
}

function TowerStackCore() {
  const [currentBlockWidth, setCurrentBlockWidth] =
    useState(DEFAULT_BLOCK_WIDTH);
  const [score, setScore] = useState(0);
  const [currentBlockXPercent, setCurrentBlockXPercent] =
    useState(defaultBlockXPercent);
  const targetBlockRef = useRef(null);
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFromLeft, setIsFromLeft] = useState(true);
  const { concentration } = useReceiveEeg();

  concentration.useFocus(() => {
    setIsFocus(true);
  });

  concentration.useRelax(() => {
    setIsFocus(false);
  });

  useEffect(() => {
    const currentBlockMoverInterval = setInterval(() => {
      if (isFocus) {
        setCurrentBlockXPercent(
          ({ fromCenter: fromCenterPrev, withinCenter: withinCenterPrev }) => {
            const fromCenterResult = Math.max(fromCenterPrev - 1, 0);
            const withinCenterResult =
              fromCenterResult <= 0
                ? Math.max(0, withinCenterPrev - 1)
                : withinCenterPrev;

            // console.log(withinCenterResult);
            return {
              ...{
                fromCenter: fromCenterResult,
                withinCenter: withinCenterResult,
              },
            };
          }
        );
      } else {
        setCurrentBlockXPercent(
          ({ fromCenter: fromCenterPrev, withinCenter: withinCenterPrev }) => {
            const withinCenterResult = Math.min(100, withinCenterPrev + 1);

            const fromCenterResult =
              withinCenterResult >= 100
                ? Math.min(100, fromCenterPrev + 1)
                : fromCenterPrev;
            // console.log(withinCenterResult);

            return {
              ...{
                fromCenter: fromCenterResult,
                withinCenter: withinCenterResult,
              },
            };
          }
        );
      }
    }, 50);

    return () => {
      clearInterval(currentBlockMoverInterval);
    };
  }, [isFocus]);

  function resetBlock() {
    setIsFromLeft((prev) => !prev);
    setCurrentBlockXPercent(defaultBlockXPercent);
    setScore((prev) => prev + 1);
  }

  function handleDropBlock() {
    if (currentBlockXPercent.fromCenter > 0) {
      console.log("Block dropped nowhere!");
      return;
    }

    const blockWidth =
      targetBlockRef.current?.getBoundingClientRect().width ?? -1;

    if (blockWidth <= -1) {
      return;
    }

    const prevBlock =
      droppedBlocks.length > 0
        ? droppedBlocks[droppedBlocks.length - 1]
        : { leftEdge: 0, rightEdge: 100 };
    const newBlock = blockGenerator(
      isFromLeft,
      currentBlockXPercent.withinCenter,
      blockWidth,
      prevBlock,
      currentBlockWidth,
      score
    );
    console.log(newBlock);
    setDroppedBlocks((prev) => [...prev, newBlock]);
    resetBlock();
  }

  const currentBlockInCenter = currentBlockXPercent.fromCenter <= 0;

  const directionMultiplier = isFromLeft ? -1 : 1;

  return (
    <div className="flex flex-col w-full">
      <div>
        <button className="btn" onClick={handleDropBlock}>
          Drop
        </button>
      </div>
      <div
        className="flex w-full items-center relative"
        style={{
          height: `${currentBlockWidth}px`,
        }}
      >
        <div className="flex-grow h-full relative">
          <div
            className={`bg-white absolute ${
              !isFromLeft || currentBlockInCenter ? "invisible" : ""
            } `}
            style={{
              height: `${currentBlockWidth}px`,
              width: `${currentBlockWidth}px`,
              right: `min(${currentBlockXPercent.fromCenter}%, calc(100% - ${currentBlockWidth}px))`,
            }}
          ></div>
        </div>
        <div
          ref={targetBlockRef}
          className="min-h-fit h-full flex flex-col"
          style={{
            width: `${DEFAULT_BLOCK_WIDTH}px`,
          }}
        >
          <div
            className="w-full translate-x-0 bg-blue-400 relative"
            style={{
              height: `${DEFAULT_BLOCK_WIDTH}px`,
              width: `${DEFAULT_BLOCK_WIDTH}px`,
            }}
          >
            <div
              className={`bg-red-500 h-full absolute ${
                currentBlockXPercent.fromCenter <= 0 ? "block" : "hidden"
              }`}
              style={{
                width: `${DEFAULT_BLOCK_WIDTH}px`,
                right: `${currentBlockXPercent.withinCenter}%`,
              }}
            ></div>
          </div>
          {[...droppedBlocks].map(({ leftEdge, width, id }) => {
            return (
              <div
                className="bg-white"
                key={id}
                style={{
                  transform: `translateX(${leftEdge}%)`,
                  width: `${width}px`,
                  height: `${DEFAULT_BLOCK_WIDTH}px`,
                }}
              ></div>
            );
          })}
        </div>

        <div className="flex-grow h-full relative">
          <div
            className={`bg-white absolute ${
              isFromLeft || currentBlockInCenter ? "invisible" : ""
            } `}
            style={{
              height: `${currentBlockWidth}px`,
              width: `${currentBlockWidth}px`,
              left: `min(${currentBlockXPercent.fromCenter}%, calc(100% - ${currentBlockWidth}px))`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default TowerStackCore;
