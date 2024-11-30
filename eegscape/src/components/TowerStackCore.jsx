import { useEffect, useRef, useState } from "react";
import useEeg from "../hooks/useEeg";

const defaultBlockXPercent = {
  withinCenter: 0,
  fromCenter: 100,
};

function blockGenerator(
  isFromLeft,
  leftTranslate,
  blockWidth,
  prevBlock,
  targetBlockWidth,
  id
) {
  let leftEdge = isFromLeft ? leftTranslate : 100 - leftTranslate;
  let rightEdge = (blockWidth / targetBlockWidth) * 100 + leftTranslate;

  const { leftEdgePrev, rightEdgePrev, widthPrev } = prevBlock;

  leftEdge = Math.max(leftEdge, leftEdgePrev);
  rightEdge = Math.min(rightEdge, rightEdgePrev);
  const width = ((rightEdgePrev - leftEdgePrev) / 100) * targetBlockWidth;

  return {
    leftEdge,
    rightEdge,
    width,
    id
  };
}

function TowerStackCore() {
  const [currentBlockWidth, setCurrentBlockWidth] = useState(80);
  const [score, setScore] = useState(0);
  const [currentBlockXPercent, setCurrentBlockXPercent] =
    useState(defaultBlockXPercent);
  const targetBlockRef = useRef(null);
  const [droppedBlocks, setDroppedBlocks] = useState([]);
  const [isFocus, setIsFocus] = useState(false);
  const [isFromLeft, setIsFromLeft] = useState(false);
  const { concentration } = useEeg();

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
                ? Math.min(100, withinCenterPrev + 1)
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
            const withinCenterResult = Math.max(0, withinCenterPrev - 1);

            const fromCenterResult =
              withinCenterResult <= 0
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
    setScore(prev => prev + 1);
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
    setDroppedBlocks((prev) => [...prev, newBlock]);
    resetBlock();
  }

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
            className={`bg-white absolute ${isFromLeft ? "" : "invisible"} `}
            style={{
              transform: `translateX(${
                currentBlockXPercent.withinCenter / (-1 * directionMultiplier)
              }%)`,
              height: `${currentBlockWidth}px`,
              width: `${currentBlockWidth}px`,
              right: `calc(min(${currentBlockXPercent.fromCenter}%, calc(100% - ${currentBlockWidth}px)) / ${directionMultiplier})`,
            }}
          ></div>
        </div>
        <div
          ref={targetBlockRef}
          className="bg-blue-400 min-h-fit h-full flex flex-col"
          style={{
            width: `${currentBlockWidth}px`,
          }}
        >
          {[...droppedBlocks, defaultBlockXPercent].map(() => {
            return (
              <div key={}>

              </div>
            )
          })}
        </div>

        <div className="flex-grow h-full relative">
          <div
            className={`bg-white absolute ${!isFromLeft ? "" : "invisible"} `}
            style={{
              transform: `translateX(${
                currentBlockXPercent.withinCenter / (-1 * directionMultiplier)
              }%)`,
              height: `${currentBlockWidth}px`,
              width: `${currentBlockWidth}px`,
              left: `calc(min(${currentBlockXPercent.fromCenter}%, calc(100% - ${currentBlockWidth}px)) / ${directionMultiplier})`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default TowerStackCore;
