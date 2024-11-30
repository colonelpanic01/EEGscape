import { useEffect, useState } from "react";
import { EEGProvider, useEEG } from '../context/EEGContext';
import dispatchEeg from "../lib/dispatchEeg";

function EEGEmitter() {
  // Get yawDegrees, pitchDegrees, and defaultPosition from EEGContext
  const { yawDegrees, pitchDegrees, defaultPosition } = useEEG();

  // State to track the current dispatched action (only one at a time)
  const [dispatchState, setDispatchState] = useState(null);

  // Calculate the offset yaw and pitch degrees based on the default position
  const yawOffset = yawDegrees - defaultPosition?.yaw || 0;
  const pitchOffset = pitchDegrees - defaultPosition?.pitch || 0;

  useEffect(() => {
    //console.log(pitchDegrees, yawDegrees, defaultPosition, yawOffset, pitchOffset);

    // Avoid dispatching multiple actions simultaneously
    if (dispatchState) return; // Prevent if an action is already in progress

    // Handle pitch-based nods
    if (pitchOffset <= -30) {
      dispatchEeg.nod.left();
      setDispatchState("left");
    } else if (pitchOffset >= 30) {
      dispatchEeg.nod.right();
      setDispatchState("right");
    }

    // Handle yaw-based nod
    if (yawOffset >= 20) {
      dispatchEeg.nod.bottom();
      setDispatchState("bottom");
    }
  }, [yawOffset, pitchOffset, dispatchState, defaultPosition]); // dependencies include offsets and dispatch state

  // Reset dispatchState when the conditions are no longer met
  useEffect(() => {
    if (dispatchState === "left" && pitchOffset > -30) {
      setDispatchState(null);
    }
    if (dispatchState === "right" && pitchOffset < 30) {
      setDispatchState(null);
    }
    if (dispatchState === "bottom" && yawOffset < 20) {
      setDispatchState(null);
    }
  }, [pitchOffset, yawOffset, dispatchState]);

  useEffect(() => {
    dispatchEeg.tilt(yawOffset);
  }, [yawOffset])

  return null; // we're not rendering anything
}

export default EEGEmitter;