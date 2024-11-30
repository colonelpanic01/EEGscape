import { useRef, useState } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";
import PropTypes from "prop-types";

function EegInputButton(props) {
  const buttonRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [timerId, setTimerId] = useState(null);

  props.eventEmitter(() => {
    setIsActive(true);
    buttonRef.current?.click();
    if (timerId) {
      clearTimeout(timerId);
    }
    const id = setTimeout(() => {
      setIsActive(false);
      setTimerId(null);
    }, 500);
    setTimerId(id);
  });

  return (
    <button ref={buttonRef} className={`btn ${isActive ? "bg-white" : ""}`}>
      {props.children}
    </button>
  );
}

EegInputButton.propTypes = {
  // isActive: PropTypes.bool,
  children: PropTypes.node,
  eventEmitter: PropTypes.func,
};

function EegInputDisplay() {
  const { concentration, nod } = useReceiveEeg();

  return (
    <div className="flex flex-col">
      <div className="flex flex-row">
        <EegInputButton eventEmitter={concentration.useFocus}>
          Focus
        </EegInputButton>
        <EegInputButton eventEmitter={concentration.useRelax}>
          Relax
        </EegInputButton>
      </div>
      <div className="flex flex-row">
        <EegInputButton eventEmitter={nod.useNodLeft}>Nod Left</EegInputButton>
        <EegInputButton eventEmitter={nod.useNodBottom}>
          Nod Bottom
        </EegInputButton>
        <EegInputButton eventEmitter={nod.useNodRight}>
          Nod Right
        </EegInputButton>
      </div>
    </div>
  );
}

export default EegInputDisplay;
