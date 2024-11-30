import { useEffect, useRef, useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const defaultBlockXPercent = {
  withinCenter: 100,
  fromCenter: 100,
};

const DEFAULT_BLOCK_WIDTH = 80;

function blockGenerator(
  isFromLeft,
  invertWithinCenter,
  blockWidth,
  prevBlock,
  targetBlockWidth,
  id
) {
  console.table({
    isFromLeft,
    invertWithinCenter,
    blockWidth,
    prevBlock,
    targetBlockWidth,
    id,
  });
  const { rightSpace: rightSpacePrev, leftSpace: leftSpacePrev } = prevBlock;

  if (isFromLeft) {
    const rightSpace = (targetBlockWidth * invertWithinCenter) / 100;
    const leftSpace = targetBlockWidth - rightSpace - blockWidth;
    const newRightSpace = Math.max(rightSpacePrev, rightSpace);
    const newLeftSpace = Math.max(leftSpacePrev, leftSpace);
    const newWidth = targetBlockWidth - newRightSpace - newLeftSpace;

    console.table({
      rightSpace,
      leftSpace,
      newRightSpace,
      newLeftSpace,
      newWidth,
    });
    return {
      leftSpace: newLeftSpace,
      rightSpace: newRightSpace,
      width: newWidth,
      id,
    };
  } else {
    const leftSpace = (targetBlockWidth * invertWithinCenter) / 100;
    const rightSpace = targetBlockWidth - leftSpace - blockWidth;
    const newRightSpace = Math.max(rightSpacePrev, rightSpace);
    const newLeftSpace = Math.max(leftSpacePrev, leftSpace);
    const newWidth = targetBlockWidth - newRightSpace - newLeftSpace;
    console.table({
      rightSpace,
      leftSpace,
      newRightSpace,
      newLeftSpace,
      newWidth,
    });
    return {
      leftSpace: newLeftSpace,
      rightSpace: newRightSpace,
      width: newWidth,
      id,
    };
  }
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
        : { leftSpace: 0, rightSpace: 0 };
    const newBlock = blockGenerator(
      isFromLeft,
      100 - currentBlockXPercent.withinCenter,
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
            className="w-full translate-x-0 relative"
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
                right: isFromLeft
                  ? `${currentBlockXPercent.withinCenter}%`
                  : null,
                left: !isFromLeft
                  ? `${currentBlockXPercent.withinCenter}%`
                  : null,
              }}
            ></div>
          </div>
          {[...droppedBlocks]
            .reverse()
            .map(({ leftSpace, rightSpace, width, id }) => {
              return (
                <div
                  className="bg-white relative"
                  key={id}
                  style={{
                    left: `${leftSpace}px`,
                    right: `${rightSpace}px`,
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
