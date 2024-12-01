import { useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import Memory from "./Memory";
import TowerStack from "./TowerStack";
import GyroFocus from "./GyroFocus";
import {
  faArrowsToCircle,
  faBrain,
  faGopuram,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import nodRight from "./../assets/nodRight.png";
import nodLeft from "./../assets/nodLeft.png";
import nodDown from "./../assets/nodDown.png";

const Menu = () => {
  const [activeComponent, setActiveComponent] = useState("memory");
  const { nod } = useReceiveEeg();
  const [count, setCount] = useState(2); // Start with the first button selected

  const BUTTONS = [
    {
      id: 1,
      label: "Memory Game",
      icon: faBrain,
      description: "Jog your memory, literally and figuratively!",
    },
    {
      id: 2,
      label: "Tower Stack",
      icon: faGopuram,
      description: "These towers are for your eyes only.",
    },
    {
      id: 3,
      label: "GyroFocus",
      icon: faArrowsToCircle,
      description: "Can you focus when your head is shaking?",
    },
  ];

  const handleButtonClick = (buttonId) => {
    if (buttonId === 1) {
      setActiveComponent("memory");
    } else if (buttonId === 2) {
      setActiveComponent("towerstack");
    } else if (buttonId === 3) {
      setActiveComponent("gyrofocus");
    }
  };

  // Handle nods for navigation and selection
  nod.useNodLeft(() => {
    if (activeComponent === "menu") {
      setCount((prev) => (prev > 1 ? prev - 1 : prev));
    }
  });

  nod.useNodRight(() => {
    if (activeComponent === "menu") {
      setCount((prev) => (prev < 3 ? prev + 1 : prev));
    }
  });

  nod.useNodBottom(() => {
    handleButtonClick(count);
  });

  if (activeComponent === "memory") {
    return <Memory setActiveComponent={setActiveComponent} />;
  } else if (activeComponent === "gyrofocus") {
    return <GyroFocus setActiveComponent={setActiveComponent} />;
  } else if (activeComponent === "towerstack") {
    return <TowerStack setActiveComponent={setActiveComponent} />;
  }

  return (
    <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
      <div className="flex flex-col items-center gap-4 mx-auto rounded-lg shadow-lg">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Ready to eegscape!</h1>
          <p className="text-lg">Where are you eegscaping to? 🚀</p>
        </div>
        <div></div>

        {/* Add horizontal padding to the button container */}
        <div className="w-full px-6">
          <div className="flex justify-center gap-4 mb-8">
            {BUTTONS.map(({ id, icon, label, description }) => (
              <button
                key={id}
                id={`button-${id}`}
                onClick={() => handleButtonClick(id)}
                className={`py-4 px-6 rounded  min-w-[160px] transition-all flex flex-col items-center duration-200 gap-2
                bg-primary text-primary-content w-48 ${
                  count === id ? "ring-4 ring-offset-2 ring-black" : ""
                }`}
              >
                <FontAwesomeIcon className="font-bold text-2xl" icon={icon} />
                <span className="font-bold text-lg">{label}</span>
                <span>{description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center flex flex-col gap-2">
          <p className="font-medium">
            Use your head movements to select your destination
          </p>
          <div className="text-sm flex gap-4">
            <div className="bg-secondary text-secondary-content flex flex-col py-2 px-4 rounded-lg w-30 items-center justify-start">
              <img className="w-20 h-20" src={nodLeft} />
              <span className="font-bold">Nod Left</span>
              Move selection left
            </div>
            <div className="bg-secondary text-secondary-content flex flex-col py-2 px-4 rounded-lg w-30 items-center justify-start">
              <img className="w-20 h-20" src={nodDown} />
              <span className="font-bold">Nod Down</span>
              Play the game!
            </div>
            <div className="bg-secondary text-secondary-content flex flex-col py-2 px-4 rounded-lg w-30 items-center justify-start">
              <img className="w-20 h-20" src={nodRight} />
              <span className="font-bold">Nod Right</span>
              Move selection right
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
