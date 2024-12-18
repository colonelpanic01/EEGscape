import { useEffect, useState } from "react";
import { useEEG } from "../context/EEGContext";
import dispatchEeg from "../lib/dispatchEeg";

function EEGEmitter() {
  // Get yawDegrees, pitchDegrees, and defaultPosition from EEGContext
  const {
    yawDegrees,
    pitchDegrees,
    defaultPosition,
    isConcentrate,
    isBlinking,
  } = useEEG();

  // State to track the current dispatched action (only one at a time)
  const [dispatchState, setDispatchState] = useState(null);
  const [allowBlink, setAllowBlink] = useState(true); // Controls the throttling of blink dispatch

  // Calculate the offset yaw and pitch degrees based on the default position
  const yawOffset = parseFloat(
    (yawDegrees - (defaultPosition?.yaw || 0)).toFixed(2)
  );
  const pitchOffset = parseFloat(
    (pitchDegrees - (defaultPosition?.pitch || 0)).toFixed(2)
  );

  useEffect(() => {
    console.log(
      pitchDegrees,
      yawDegrees,
      defaultPosition,
      yawOffset,
      pitchOffset
    );

    // Avoid dispatching multiple actions simultaneously
    if (dispatchState) return; // Prevent if an action is already in progress

    if (isConcentrate()) {
      console.log("concentrate");
      dispatchEeg.concentration.focus();
    }
    if (!isConcentrate()) {
      console.log("relaxed");
      dispatchEeg.concentration.relax();
    }

    // Handle blinking with throttling
    if (isBlinking() && allowBlink) {
      // Check allowBlink before dispatching
      console.log("Blink DISPATCHED");
      dispatchEeg.blink();
      setAllowBlink(false); // Disable blinking temporarily
      setTimeout(() => setAllowBlink(true), 1500); // Re-enable blinking after 500ms
    }

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
  }, [yawOffset, pitchOffset, dispatchState, defaultPosition, isConcentrate]); // dependencies include offsets and dispatch state

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

  // useEffect(() => {
  //   dispatchEeg.tilt(yawOffset);
  // }, [yawOffset]);

  useEffect(() => {
    dispatchEeg.tilt(pitchOffset);
  }, [pitchOffset]);

  return null; // we're not rendering anything
}

export default EEGEmitter;
