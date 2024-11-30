import { useEffect } from "react";
import dispatchEeg from "../lib/dispatchEeg";

function MockEegEmitter() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // console.log(`Key pressed: ${event.key}`);
      // You can add custom logic based on the key pressed here
      if (event.key === "f") {
        dispatchEeg.concentration.focus();
        return;
      }
      if (event.key === "r") {
        dispatchEeg.concentration.relax();
        return;
      }
    };

    // Attach the event listener once
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array ensures this runs only once
}

export default MockEegEmitter;
