import React, { useState, useRef, useEffect } from "react";
import { MuseClient, zipSamples } from "muse-js";
import { epoch, fft, powerByBand, bandpassFilter } from "@neurosity/pipes";
import { Line } from "react-chartjs-2";
import { bandpass } from "./bandpass";
import "chart.js/auto";
import * as THREE from "three";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

function chartOptions(min, max) {
  return {
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: "Time",
          color: "grey",
        },
        ticks: {
          color: "grey",
        },
        border: {
          color: "grey",
        },
      },
      y: {
        title: {
          display: true,
          text: "UVrms",
        },
        min: min,
        max: max,
        ticks: {
          color: "grey",
        },
        border: {
          color: "grey",
        },
      },
    },
    elements: {
      line: {
        borderColor: "grey",
        borderWidth: 1,
      },
      point: {
        radius: 0,
        borderColor: "grey",
        backgroundColor: "grey",
      },
    },
    animation: {
      duration: 0,
    },
    plugins: {
      legend: {
        labels: {
          color: "grey",
        },
      },
    },
  };
}

export default function MuseConnectPage() {
  const [defaultPosition, setDefaultPosition] = useState({
    yaw: 0,
    pitch: 0,
  });
  const [status, setStatus] = useState("Disconnected");
  const isConnected = status !== "Disconnected" && status !== "Connecting...";
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

  // Chart for filtered Channel 3
  const [filteredChartData, setFilteredChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Active/Calm Data",
        borderColor: "#36A2EB",
        data: [],
        fill: false,
      },
    ],
  });

  const [blinkChartData, setBlinkChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Blink Data",
        borderColor: "#FFFFFF",
        data: [],
        fill: false,
      },
    ],
  });

  // Variables for uMeans and uVrms calculations
  const uMeans = useRef(0);
  const uVrms = useRef(0);

  const blinkuVrms = useRef(0);
  const blinkuMeans = useRef(0);

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

  const [kMeansCentroids, setKMeansCentroids] = useState([]);
  // Initialize K-Means
  const k = 2; // Two clusters: Relaxation and Concentration
  useEffect(() => {
    // Initial dummy centroids
    const initialCentroids = [
      // delta (0.5–4 Hz)
      // theta (4-8 hz)
      // alpha (8-13 hz)
      // beta (13-30 hz)
      // gamma (30-100 hz)
      [10, 4.5, 3.2, 2.0, 1.07], // relaxation
      [35, 21, 5.5, 1.8, 0.98], // concentration
    ];
    setKMeansCentroids(initialCentroids);
  }, []);

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      museClientRef.current = museClient;
      setStatus("Connected");

      // Initialize bandpass filter for Channel 3
      const bandpassFilter = bandpass(256, 0.1, 50); // Sampling rate: 256 Hz, Passband: 1-30 Hz

      // yippee time to subscribe to accelerometer data

      // obtain eeg readings
      zipSamples(museClient.eegReadings)
        .pipe(
          epoch({ duration: 256, interval: 5, samplingRate: 256 }),
          //bandpassFilter({ cutoffFrequencies: [1, 50], samplingRate: 256 }),
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
          classifyWithKMeans(bandData);

          //concentration and relaxation metrics
          //calculateMetrics(bandData);
        });
      // Subscribe to raw EEG data for Channel 3 filtering
      const peakWindow = 1;
      zipSamples(museClient.eegReadings)
        .pipe(epoch({ duration: 256, interval: 5, samplingRate: 256 }))
        .subscribe((data) => {
          const blinkData = data.data[0];
          const currentTime = new Date().toLocaleTimeString();

          blinkData.forEach((amplitude, index) => {
            blinkuMeans.current =
              0.995 * blinkuMeans.current + 0.005 * amplitude;
            blinkuMeans.current = Math.sqrt(
              0.995 * blinkuMeans.current ** 2 +
                0.005 * (amplitude - blinkuMeans.current) ** 2
            );
          });

          // console.log("blinkuMeans.current", blinkuMeans.current);
          // Update the filtered uVrms chart
          setBlinkChartData((prevData) => {
            const newLabels = [...prevData.labels, currentTime];
            if (newLabels.length > 150) newLabels.shift();

            const newData = [...prevData.datasets[0].data, blinkuMeans.current];
            if (newData.length > 150) newData.shift();

            return {
              labels: newLabels,
              datasets: [{ ...prevData.datasets[0], data: newData }],
            };
          });
        });

      zipSamples(museClient.eegReadings)
        .pipe(epoch({ duration: 256, interval: 5, samplingRate: 256 }))
        .subscribe((data) => {
          const channel3Data = data.data[3]; // Get Channel 3 values
          const filteredData = channel3Data.map((value) =>
            bandpassFilter(value)
          );

          // Calculate uVrms for each timestamp
          filteredData.forEach((amplitude) => {
            uMeans.current = 0.995 * uMeans.current + 0.005 * amplitude;
            uVrms.current = Math.sqrt(
              0.995 * uVrms.current ** 2 +
                0.005 * (amplitude - uMeans.current) ** 2
            );
          });

          const currentTime = new Date().toLocaleTimeString();

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

  useEffect(() => {
    if (museClientRef.current) {
      museClientRef.current.accelerometerData.subscribe((data) => {
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
          console.log("YAW CURRENT", yawAngle);
          console.log("DEFAULT:", defaultPosition.yaw);
          const yawRotation = new THREE.Quaternion().setFromAxisAngle(
            yAxis,
            yawAngle
          );
          const pitchAngle =
            Math.atan2(gVector.y, gVector.z) - defaultPosition.pitch;
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
          console.error("ruh ro, error in the accelommeter data:", data);
        }
      });
    }
  }, [museClientRef]);

  const euclideanDistance = (point1, point2) => {
    return Math.sqrt(
      point1.reduce(
        (sum, val, index) => sum + Math.pow(val - point2[index], 2),
        0
      )
    );
  };

  const classifyWithKMeans = (bandData) => {
    const distances = kMeansCentroids.map((centroid) =>
      euclideanDistance(bandData, centroid)
    );
    const clusterIndex = distances.indexOf(Math.min(...distances));

    const metricsUpdate =
      clusterIndex === 0
        ? { relaxation: 1, concentration: 0 }
        : { relaxation: 0, concentration: 1 };

    setMetrics(metricsUpdate);
  };

  const handleChannelChange = (e) => {
    setSelectedChannel(Number(e.target.value));
  };

  const uVrmsValue = uVrms.current;

  const configureDefaultPosition = () => {
    if (museClientRef.current) {
      const subscription = museClientRef.current.accelerometerData.subscribe(
        (data) => {
          if (data && Array.isArray(data.samples) && data.samples.length > 0) {
            const { x, y, z } = data.samples[0];
            const gVector = new THREE.Vector3(x, y, z);
            const yawAngle = Math.atan2(gVector.x, gVector.z).toFixed(2);
            const pitchAngle = Math.atan2(gVector.y, gVector.z).toFixed(2);
            console.log("Setting default position:", yawAngle, pitchAngle);
            setDefaultPosition({ yaw: yawAngle, pitch: pitchAngle }); // Set the default position with calculated values

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

  return (
    <>
      <h1 className="text-3xl font-bold mb-4">Visualize EEG Metrics</h1>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>

        <div className="flex flex-col mx-auto w-fit items-center gap-8 mb-8">
          <button
            onClick={connectToMuse}
            className={`transition w-fit btn ${
              isConnected ? "btn-disabled" : ""
            } btn-primary`}
          >
            Connect your Muse Device
            {isConnected && (
              <FontAwesomeIcon
                className="text-success text-lg"
                icon={faCircleCheck}
              />
            )}
          </button>
          <button
            onClick={configureDefaultPosition}
            className="transition w-fit btn"
          >
            Calibrate Your Position
          </button>
        </div>

        {/* Dropdown for channel selection */}
        <div className="mb-8 bg-secondary w-fit mx-auto btn rounded-lg">
          <label htmlFor="channel-select" style={{ marginRight: "10px" }}>
            Select Channel:
          </label>
          <select
            id="channel-select"
            value={selectedChannel}
            onChange={handleChannelChange}
            className="bg-secondary"
            style={{ padding: "5px", fontSize: "16px" }}
          >
            <option value="0">Channel 0</option>
            <option value="1">Channel 1</option>
            <option value="2">Channel 2</option>
            <option value="3">Channel 3</option>
          </select>
        </div>

        {/* EEG Graph */}
        <div className="w-full h-64">
          <Line data={chartData} options={chartOptions(0, 50)} />
        </div>

        {/* Filtered Channel 3 Chart */}
        <div className="w-full h-64">
          <Line data={filteredChartData} options={chartOptions(0, 150)} />
        </div>

        <div className="w-full h-64">
          <Line data={blinkChartData} options={chartOptions(0, 200)} />
        </div>

        {/* <div className="w-full h-64">
          {uVrmsValue > 20 ? (
            <p style={{ color: "green", fontWeight: "bold" }}>
              Focused state of mind
            </p>
          ) : uVrmsValue <= 20 ? (
            <p style={{ color: "blue", fontWeight: "bold" }}>
              Relaxed state of mind
            </p>
          ) : null}
        </div> */}

        {/* Metrics Display */}
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <div style={{ fontSize: "18px", paddingRight: "15px" }}>
            Relaxation: {metrics.relaxation.toFixed(2)}
          </div>
          <div
            style={{ fontSize: "18px", display: "flex", paddingRight: "15px" }}
          >
            Focus: {metrics.concentration.toFixed(2)}
          </div>
          {/* Conditional Display */}
          <div style={{ fontSize: "18px", display: "flex" }}>
            {metrics.concentration > metrics.relaxation ? (
              <span style={{ color: "red", fontWeight: "bold" }}>
                Concentrated
              </span>
            ) : (
              <span style={{ color: "blue", fontWeight: "bold" }}>Relaxed</span>
            )}
          </div>
        </div>

        {/* Head tracking stuff */}

        <div className="w-48 mx-auto">
          <div ref={sceneRef} className="" />

          <h3>Head Movement Data:</h3>
          <p>Right/Left Tilt: {pitchDegrees}°</p>
          <p>Up/Down Tilt: {yawDegrees}°</p>
          {/* <p>Right/Left Tilt: {yawDegrees}°</p>
        <p>Up/Down Tilt: {pitchDegrees}°</p> */}
        </div>
      </div>
    </>
  );
}
