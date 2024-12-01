import { useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import Memory from "./Memory";
import GyroFocus from "./GyroFocus";
import Metrics from "./Metrics";

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState("menu");
  const { nod } = useReceiveEeg();
  const [count, setCount] = useState(2); // Start with the first button selected

  const BUTTONS = [
    { id: 1, color: "red", label: "Memory Game" },
    { id: 2, color: "blue", label: "Coming soon" },
    { id: 3, color: "green", label: "GyroFocus" },
  ];

  const handleButtonClick = (buttonId) => {
    if (buttonId === 1) {
      setActiveComponent("memory");
    } else if (buttonId === 2) {
      console.log(`Component ${buttonId} selected - not yet implemented`);
    } else if (buttonId === 3) {
      setActiveComponent("gyrofocus");
    }
  };

  // Handle nods for navigation and selection
  nod.useNodLeft(() => {
    setCount((prev) => (prev > 1 ? prev - 1 : prev));
  });

  nod.useNodRight(() => {
    setCount((prev) => (prev < 3 ? prev + 1 : prev));
  });

  nod.useNodBottom(() => {
    handleButtonClick(count);
  });

  if (activeComponent === "memory") {
    return <Memory setActiveComponent={setActiveComponent} />;
  }
  if (activeComponent === "gyrofocus") {
    return <GyroFocus setActiveComponent={setActiveComponent} />;
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="flex flex-col items-center space-y-8 py-8 max-w-[600px] mx-auto bg-gray-100 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Headset Connected!</h1>
          <p className="text-lg text-gray-700">
            Please select a game to begin:
          </p>
        </div>
        <div></div>

        {/* Add horizontal padding to the button container */}
        <div className="w-full px-6">
          <div className="flex justify-center gap-4 mb-8">
            {BUTTONS.map(({ id, color, label }) => (
              <button
                key={id}
                id={`button-${id}`}
                onClick={() => handleButtonClick(id)}
                className={`py-4 px-6 rounded text-lg font-semibold min-w-[160px] transition-all duration-200
                  bg-${color}-500 hover:bg-${color}-600 text-white ${
                  count === id ? "ring-4 ring-offset-2 ring-black" : ""
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-center text-gray-600 space-y-2">
          <p className="font-medium">Use head movements to select a game:</p>
          <p className="text-sm">
            <span className="font-bold">Nod Left:</span> Move selection left |{" "}
            <span className="font-bold">Nod Right:</span> Move selection right |{" "}
            <span className="font-bold">Nod Down:</span> Confirm
          </p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
