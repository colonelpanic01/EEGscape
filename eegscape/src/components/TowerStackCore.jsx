import { useEffect, useState } from "react";
import useEeg from "../hooks/useEeg";

function blockGenerator(
  isFromLeft,
  leftTranslate,
  blockWidth,
  prevBlockWidth,
  targetBlockWidth
) {
  leftTranslate = isFromLeft ? leftTranslate : 100 - leftTranslate;
  const rightEdge = (blockWidth / targetBlockWidth) * 100 + leftTranslate;

  return {
    leftEdge: leftTranslate,
    rightEdge,
  };
}

function TowerStackCore() {
  const [currentBlockWidth, setCurrentBlockWidth] = useState(80);
  const [currentBlockXPercent, setCurrentBlockXPercent] = useState({
    withinCenter: 0,
    fromCenter: 100,
  });
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

  const directionMultiplier = isFromLeft ? -1 : 1;

  return (
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
        className="bg-white h-full"
        style={{
          width: `${currentBlockWidth}px`,
        }}
      ></div>

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
  );
}

export default TowerStackCore;
