import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import { MuseClient, zipSamples } from "muse-js";
import { epoch, fft, powerByBand } from "@neurosity/pipes";
import * as THREE from "three";

// Create the context
const EEGContext = createContext();

// EEGContext provider component
export const EEGProvider = ({ children }) => {
  const [status, setStatus] = useState("Disconnected");
  const [metrics, setMetrics] = useState({
    concentration: 0,
    relaxation: 0,
    fatigue: 0,
  });
  const [yawDegrees, setYawDegrees] = useState(0);
  const [pitchDegrees, setPitchDegrees] = useState(0);
  const [defaultPosition, setDefaultPosition] = useState({ yaw: 0, pitch: 0 });

  const museClientRef = useRef(null);

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      museClientRef.current = museClient;
      setStatus("Connected");

      museClient.accelerometerData.subscribe((data) => {
        if (data && Array.isArray(data.samples) && data.samples.length > 0) {
          const { x, y, z } = data.samples[0];
          const gVector = new THREE.Vector3(x, y, z);
          const yawAngle = Math.atan2(gVector.x, gVector.z);
          const pitchAngle = Math.atan2(gVector.y, gVector.z);

          setYawDegrees(THREE.MathUtils.radToDeg(yawAngle).toFixed(2));
          setPitchDegrees(THREE.MathUtils.radToDeg(pitchAngle).toFixed(2));
        } else {
          console.error("Error in accelerometer data:", data);
        }
      });

      zipSamples(museClient.eegReadings)
        .pipe(
          epoch({ duration: 1024, interval: 250, samplingRate: 256 }),
          fft({ bins: 256 }),
          powerByBand()
        )
        .subscribe((data) => {
          const bandData = [
            data.delta[0], // example for channel 0, you can change the logic for selecting channels
            data.theta[0],
            data.alpha[0],
            data.beta[0],
            data.gamma[0],
          ];

          calculateMetrics(bandData);
        });
        
    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
  };

  const calculateMetrics = (bandData) => {
    const [delta, theta, alpha, beta, gamma] = bandData;
    const relaxation = alpha / (delta || 1);
    const fatigue = (theta + alpha) / (beta || 1);
    const concentration = beta / (theta || 1);

    setMetrics({ relaxation, fatigue, concentration });
  };

  const configureDefaultPosition = () => {
    if (museClientRef.current) {
      const subscription = museClientRef.current.accelerometerData.subscribe((data) => {
        if (data && Array.isArray(data.samples) && data.samples.length > 0) {
          const { x, y, z } = data.samples[0];
          const gVector = new THREE.Vector3(x, y, z);
          const yawAngle = Math.atan2(gVector.x, gVector.z);
          const pitchAngle = Math.atan2(gVector.y, gVector.z);
  
          const yawDegrees = THREE.MathUtils.radToDeg(yawAngle).toFixed(2); // Calculate yaw degrees
          const pitchDegrees = THREE.MathUtils.radToDeg(pitchAngle).toFixed(2); // Calculate pitch degrees
  
          console.log('Setting default position:', yawDegrees, pitchDegrees);
          setDefaultPosition({ yaw: yawDegrees, pitch: pitchDegrees }); // Set the default position with calculated values
  
          // Unsubscribe after capturing the first snapshot
          subscription.unsubscribe();
        } else {
          console.error('Error in accelerometer data:', data);
        }
      });
    } else {
      console.error('MuseClient instance is not connected yet.');
    }
  };

  const value = {
    status,
    metrics,
    yawDegrees,
    pitchDegrees,
    connectToMuse,
    configureDefaultPosition,
    defaultPosition,
  };

  return <EEGContext.Provider value={value}>{children}</EEGContext.Provider>;
};

// Custom hook to use the EEGContext
export const useEEG = () => {
  return useContext(EEGContext);
};
