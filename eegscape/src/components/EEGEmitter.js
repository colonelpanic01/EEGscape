import { useEffect } from "react";
import { EEGProvider } from '../context/EEGContext';
import dispatchEeg from "../lib/dispatchEeg";

function EEGEmitter() {
  // Get yawDegrees and pitchDegrees from the EEGContext
  const { yawDegrees, pitchDegrees } = EEGProvider();

  useEffect(() => {
    
    if (pitchDegrees <= -30) {
      dispatchEeg.nod.left(); // Trigger left tilt if pitch is <= -30
    }

    if (pitchDegrees >= 30) {
      dispatchEeg.nod.right(); // Trigger right tilt if pitch is >= 30
    }

    if (yawDegrees >= 20) {
      dispatchEeg.nod.bottom(); // Trigger bottom nod if yaw is >= 20
    }
  }, [yawDegrees, pitchDegrees]); // run the effect when yawDegrees or pitchDegrees change

  return null; // we're not rendering anything
}

export default EEGEmitter;
