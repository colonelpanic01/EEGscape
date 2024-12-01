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
  const [defaultPosition, setDefaultPosition] = useState({
    yaw: yawDegrees,
    pitch: pitchDegrees,
  });
  const [chartData, setChartData] = useState({
    labels: [], // for time points
    datasets: [
      { label: "Delta", borderColor: "#FF6384", data: [], fill: false },
      { label: "Theta", borderColor: "#36A2EB", data: [], fill: false },
      { label: "Alpha", borderColor: "#FFCE56", data: [], fill: false },
      { label: "Beta", borderColor: "#4BC0C0", data: [], fill: false },
      { label: "Gamma", borderColor: "#9966FF", data: [], fill: false },
    ],
  });

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
          const currentTime = new Date().toLocaleTimeString();
          const bandData = [
            data.delta[0], // example for channel 0, you can change the logic for selecting channels
            data.theta[0],
            data.alpha[0],
            data.beta[0],
            data.gamma[0],
          ];

          // update the chart data
          setChartData((prevData) => {
            const newLabels = [...prevData.labels, currentTime];
            if (newLabels.length > 50) newLabels.shift();

            const newDatasets = prevData.datasets.map((dataset, index) => {
              const newData = [...dataset.data, bandData[index]];
              if (newData.length > 50) newData.shift();
              return { ...dataset, data: newData };
            });

            return { labels: newLabels, datasets: newDatasets };
          });

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
      const subscription = museClientRef.current.accelerometerData.subscribe(
        (data) => {
          if (data && Array.isArray(data.samples) && data.samples.length > 0) {
            const { x, y, z } = data.samples[0];
            const gVector = new THREE.Vector3(x, y, z);
            const yawAngle = Math.atan2(gVector.x, gVector.z);
            const pitchAngle = Math.atan2(gVector.y, gVector.z);

            const yawDegrees = THREE.MathUtils.radToDeg(yawAngle).toFixed(2); // Calculate yaw degrees
            const pitchDegrees =
              THREE.MathUtils.radToDeg(pitchAngle).toFixed(2); // Calculate pitch degrees

            console.log("Setting default position:", yawDegrees, pitchDegrees);
            setDefaultPosition({ yaw: yawDegrees, pitch: pitchDegrees }); // Set the default position with calculated values

            setStatus("Calibrated");

            // Unsubscribe after capturing the first snapshot
            subscription.unsubscribe();
          } else {
            console.error("Error in accelerometer data:", data);
          }
        }
      );
    } else {
      console.error("MuseClient instance is not connected yet.");
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
    chartData,
  };

  return <EEGContext.Provider value={value}>{children}</EEGContext.Provider>;
};

// Custom hook to use the EEGContext
export const useEEG = () => {
  return useContext(EEGContext);
};
