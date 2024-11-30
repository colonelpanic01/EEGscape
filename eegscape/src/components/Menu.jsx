import { useState } from 'react';
import useEeg from "../hooks/useEeg";
import Memory from './Memory';

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState('menu');
  const { nod } = useEeg();
  const [count, setCount] = useState(2); // Start with the first button selected

  const BUTTONS = [
    { id: 1, color: 'red', label: "Memory Game" },
    { id: 2, color: 'blue', label: "Coming soon" },
    { id: 3, color: 'green', label: "Coming soon" }
  ];

  const handleButtonClick = (buttonId) => {
    if (buttonId === 1) {
      setActiveComponent('memory');
    } else {
      console.log(`Component ${buttonId} selected - not yet implemented`);
    }
  };

  // Handle nods for navigation and selection
  nod.useNodLeft(() => {
    setCount((prev) => (prev > 1 ? prev - 1 : prev)); // Wrap around to last button
  });

  nod.useNodRight(() => {
    setCount((prev) => (prev < 3 ? prev + 1 : prev)); // Wrap around to first button
  });

  nod.useNodBottom(() => {
    handleButtonClick(count); // Trigger the selected button
  });

  if (activeComponent === 'memory') {
    return <Memory setActiveComponent={setActiveComponent} />;
  }

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold mb-4">Headset Connected!</h1>
        <p className="text-lg mb-8">Please select a game to begin</p>
      </div>
      <div className="flex justify-center gap-4 mb-8">
        {BUTTONS.map(({ id, color, label }) => (
          <button
            key={id}
            id={`button-${id}`}
            onClick={() => handleButtonClick(id)}
            className={`
              py-4 px-6 rounded text-lg font-semibold min-w-[160px] 
              transition-colors duration-200 
              ${count === id ? `bg-${color}-500 ring-4 ring-offset-2 ring-black` : `bg-${color}-500`}
              text-white
            `}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="text-center text-gray-600">
        <p>Use head movements to select a game:</p>
        <p>Nod Left: Move selection left | Nod Right: Move selection right | Nod Down: Confirm</p>
      </div>
    </div>
  );
};

export default Menu;
