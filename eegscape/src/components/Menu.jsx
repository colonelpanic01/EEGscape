import { useState } from 'react';
import useEeg from "../hooks/useEeg";
import Memory from './Memory';

const Menu = () => {

  const [activeComponent, setActiveComponent] = useState('menu');
  const { concentration, nod } = useEeg();

  const BUTTONS = [
    {
      id: 1,
      color: 'red',
      label: "Memory Game"
    },
    {
      id: 2,
      color: "blue",
      label: "Coming soon"
    },
    {
      id: 3,
      color: "green",
      label: "Coming soon"
    }
  ]

  const handleButtonClick = (buttonId) => {
    if (buttonId == 1) {
      setActiveComponent('memory')
    }
    else if (buttonId == 2) {
      console.log('Component 2 selected - not yet implemented');
    }
    else if (buttonId == 3) {
      console.log('Component 3 selected - not yet implemented');
    }
  }

  // EEG nod handlers
  nod.useNodLeft(() => {
    handleButtonClick(1); // Left button (red)
  });

  nod.useNodBottom(() => {
    handleButtonClick(2); // Middle button (blue)
  });

  nod.useNodRight(() => {
    handleButtonClick(3); // Right button (green)
  });

  if (activeComponent === 'memory') {
    return <Memory />;
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
            className={`bg-${color}-500 text-white py-4 px-6 rounded 
              hover:bg-${color}-600 transition-colors duration-200
              text-lg font-semibold min-w-[160px]`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="text-center text-gray-600">
        <p>Use head movements to select a game:</p>
        <p>Nod Left: Memory Game | Nod Down: Game 2 | Nod Right: Game 3</p>
      </div>
    </div>
  );
}

export default Menu;
