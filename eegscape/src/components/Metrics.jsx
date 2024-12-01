import React, { useState, useEffect } from "react";
import EEGGraph from "./EEGGraph";
import HeadMovementVisualization from "./HeadMovementVisualization";

const Metrics = () => {
  // State to track visibility of internal components
  const [showComponents, setShowComponents] = useState(true);

  useEffect(() => {
    // Event listener for the 'm' key press to toggle visibility
    const handleKeyPress = (event) => {
      if (event.key === "m" || event.key === "M") {
        setShowComponents((prevState) => !prevState);
      }
    };

    // Attach event listener on component mount
    window.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return (
    <div className="flex fixed h-fit overflow-hidden top-0 p-4 flex-row space-x-4 w-screen justify-between">
      {/* Conditionally render EEGGraph and HeadMovementVisualization based on showComponents state */}
      {showComponents && (
        <>
          <EEGGraph />
          <HeadMovementVisualization />
        </>
      )}
    </div>
  );
};

export default Metrics;