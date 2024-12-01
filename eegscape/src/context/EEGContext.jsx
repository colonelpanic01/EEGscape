import React, {
  createContext,
  useState,
  useRef,
  useEffect,
  useContext,
} from "react";
import { MuseClient, zipSamples } from "muse-js";
import { epoch, fft, powerByBand } from "@neurosity/pipes";
import { bandpass } from "../inputs/bandpass";
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
      { label: "Filtered Channel 3", borderColor: "#EB6C36", data: [], fill: false },
    ],
  });

  const museClientRef = useRef(null);
  const uVrms = useRef(0); // reference to store uVrms value
  const uMeans = useRef(0);

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      museClientRef.current = museClient;
      setStatus("Connected");

      // Initialize bandpass filter for Channel 3
      const bandpassFilter = bandpass(256, 0.1, 50);

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
            data.delta[3], // example for channel 3, you can change the logic for selecting channels
            data.theta[3],
            data.alpha[3],
            data.beta[3],
            data.gamma[3],
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

          //calculateMetrics(bandData);
      });
      
      // Subscribe to raw EEG data for Channel 3 filtering
      zipSamples(museClient.eegReadings)
      .pipe(epoch({ duration: 256, interval: 50, samplingRate: 256 }))
      .subscribe((data) => {
      const channel3Data = data.data[3]; // Get Channel 3 values
      const filteredData = channel3Data.map((value) => bandpassFilter(value));
      
      // Calculate uVrms for each timestamp
      filteredData.forEach((amplitude) => {
        uMeans.current = 0.995 * uMeans.current + 0.005 * amplitude;
          uVrms.current = Math.sqrt(
            0.995 * uVrms.current ** 2 + 0.005 * (amplitude - uMeans.current) ** 2
          );
        });

        // Update the filtered uVrms chart
        setFilteredChartData((prevData) => {
          const newLabels = [...prevData.labels, currentTime];
          if (newLabels.length > 50) newLabels.shift();

          const newData = [...prevData.datasets[0].data, uVrms.current];
          if (newData.length > 50) newData.shift();

          return {
            labels: newLabels,
            datasets: [{ ...prevData.datasets[0], data: newData }],
          };
        });
      });

    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
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

  const isConcentrate  = () => {
    return uVrms.current > 20;
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
    isConcentrate,
  };

  return <EEGContext.Provider value={value}>{children}</EEGContext.Provider>;
};

// Custom hook to use the EEGContext
export const useEEG = () => {
  return useContext(EEGContext);
};
