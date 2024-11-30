import { useState, useRef, useEffect } from "react";
import { MuseClient, zipSamples } from "muse-js";
import { epoch, fft, powerByBand } from "@neurosity/pipes";
import "chart.js/auto";
import * as THREE from "three";

function useMuse() {
  const [status, setStatus] = useState("Disconnected");
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [metrics, setMetrics] = useState({
    concentration: 0,
    relaxation: 0,
    fatigue: 0,
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

  // details for head mapping in 3d space (as cube)
  const [yawDegrees, setYawDegrees] = useState(0);
  const [pitchDegrees, setPitchDegrees] = useState(0);
  const sceneRef = useRef(null);
  const objectRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (sceneRef.current) {
      while (sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild);
      }
    }

    // initializing the Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true }); // alpha for transparent background
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // creating cube to rep object in 3D space
    const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const material = new THREE.MeshBasicMaterial({ color: 0xafe1af });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objectRef.current = cube;
    camera.position.z = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // function to cleanup and stop rendering when the component unmounts
    return () => {
      if (scene) {
        scene.remove(cube);
        geometry.dispose();
        material.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const museClientRef = useRef(null);

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      museClientRef.current = museClient;
      setStatus("Connected");

      // yippee time to subscribe to accelerometer data
      museClient.accelerometerData.subscribe((data) => {
        //console.log("Accelerometer data:", data);
        if (data && Array.isArray(data.samples) && data.samples.length > 0) {
          const { x, y, z } = data.samples[0];

          // convert accelerometer data into a 3D vector and apply rotation to the cube to match head tilt
          const gVector = new THREE.Vector3(x, y, z);
          // for some reason the x and y values are flipped
          const xAxis = new THREE.Vector3(0, 1, 0);
          const yAxis = new THREE.Vector3(1, 0, 0);
          // determine yaw and pitch and final rotation
          const yawAngle = Math.atan2(gVector.x, gVector.z);
          const yawRotation = new THREE.Quaternion().setFromAxisAngle(
            yAxis,
            yawAngle
          );
          const pitchAngle = Math.atan2(gVector.y, gVector.z);
          const pitchRotation = new THREE.Quaternion().setFromAxisAngle(
            xAxis,
            pitchAngle
          );
          const finalRotation = yawRotation.multiply(pitchRotation);

          // update the cubes rotation
          if (objectRef.current) {
            objectRef.current.quaternion.copy(finalRotation);
          }

          // update yaw and pitch degrees (radians to degrees)
          const yawDegrees = THREE.MathUtils.radToDeg(yawAngle);
          const pitchDegrees = THREE.MathUtils.radToDeg(pitchAngle);
          setYawDegrees(yawDegrees.toFixed(2));
          setPitchDegrees(pitchDegrees.toFixed(2));
        } else {
          console.error("ruh ro, error in the accelommeter data data:", data);
        }
      });
      // obtain eeg readings
      zipSamples(museClient.eegReadings)
        .pipe(
          epoch({ duration: 1024, interval: 250, samplingRate: 256 }),
          fft({ bins: 256 }),
          powerByBand()
        ) // subscribe to band and channel from the stream
        .subscribe((data) => {
          const currentTime = new Date().toLocaleTimeString();
          const bandData = [
            data.delta[selectedChannel],
            data.theta[selectedChannel],
            data.alpha[selectedChannel],
            data.beta[selectedChannel],
            data.gamma[selectedChannel],
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

          // concentration and relaxation metrics
          calculateMetrics(bandData);
        });
    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
  };

  const calculateMetrics = (bandData) => {
    const [delta, theta, alpha, beta, gamma] = bandData;

    const relaxation = alpha / (delta || 1); // Avoid division by zero
    const fatigue = (theta + alpha) / (beta || 1);
    const concentration = beta / (theta || 1);

    setMetrics({ relaxation, fatigue, concentration });
  };

  const handleChannelChange = (e) => {
    setSelectedChannel(Number(e.target.value));
  };
  return {
    status: {
      set: setStatus,
      value: status,
    },
    channel: {
      selected: selectedChannel,
      handleChange: handleChannelChange,
    },
    metrics,
    sceneRef,
    degrees: {
      pitch: pitchDegrees,
      yaw: yawDegrees,
    },
    connectToMuse,
    chartData,
  };
}

export default useMuse;
