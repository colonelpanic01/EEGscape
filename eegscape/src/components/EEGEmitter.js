import { useEffect, useState } from "react";
import { EEGProvider, useEEG } from '../context/EEGContext';
import dispatchEeg from "../lib/dispatchEeg";

function EEGEmitter() {
  // Get yawDegrees and pitchDegrees from the EEGContext
  const { yawDegrees, pitchDegrees } = useEEG();

  // States to track whether an action has been dispatched for pitch and yaw
  const [leftNodDispatched, setLeftNodDispatched] = useState(false);
  const [rightNodDispatched, setRightNodDispatched] = useState(false);
  const [bottomNodDispatched, setBottomNodDispatched] = useState(false);

  useEffect(() => {
    console.log(pitchDegrees, yawDegrees);

    // Check pitchDegrees for left nod
    if (pitchDegrees <= -30 && !leftNodDispatched) {
      dispatchEeg.nod.left(); // Trigger left tilt if pitch is <= -30
      setLeftNodDispatched(true); // Mark as dispatched
    } else if (pitchDegrees > -30 && leftNodDispatched) {
      setLeftNodDispatched(false); // Reset if condition no longer met
    }

    // Check pitchDegrees for right nod
    if (pitchDegrees >= 30 && !rightNodDispatched) {
      dispatchEeg.nod.right(); // Trigger right tilt if pitch is >= 30
      setRightNodDispatched(true); // Mark as dispatched
    } else if (pitchDegrees < 30 && rightNodDispatched) {
      setRightNodDispatched(false); // Reset if condition no longer met
    }

    // Check yawDegrees for bottom nod
    if (yawDegrees >= 20 && !bottomNodDispatched) {
      dispatchEeg.nod.bottom(); // Trigger bottom nod if yaw is >= 20
      setBottomNodDispatched(true); // Mark as dispatched
    } else if (yawDegrees < 20 && bottomNodDispatched) {
      setBottomNodDispatched(false); // Reset if condition no longer met
    }
  }, [yawDegrees, pitchDegrees, leftNodDispatched, rightNodDispatched, bottomNodDispatched]); // dependencies updated to include the dispatched states

  return null; // we're not rendering anything
}

export default EEGEmitter;
