import React, { useState, useCallback, useEffect } from "react";
import { MuseClient } from "muse-js";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function MuseConnectPage() {
  const [status, setStatus] = useState("Disconnected");
  const [waveData, setWaveData] = useState([
    // Starting sample data
    500, 600, 2000
  ]);
  const [labels, setLabels] = useState([]);

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      setStatus("Connected");

      // Subscribe to EEG data
      museClient.eegReadings.subscribe((reading) => {
        console.log("Reading:", reading.samples[0]);
        const samples = reading.samples[0]; // Extract samples array
        
        setWaveData((prevData) => [
          ...prevData,
          ...samples,
        ]);
        console.log("Wave Data:", waveData);
      });

      window.museClient = museClient;
    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
  };

  const data = {
    labels: waveData.map((_, index) => index), // Use index as labels
    datasets: [
      {
        label: "EEG Signal",
        data: waveData,
        borderColor: "blue",
        borderWidth: 1,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        display: false, // Hide x-axis labels for simplicity
      },
      y: {
        suggestedMin: 0, // Set min and max for EEG signal
        suggestedMax: 2000,
      },
    },
    animation: false, // Disable animations for real-time performance
  };

  return (
    <div className="bg-white">
      <h1>EEGscape</h1>
      <p>Status: {status}</p>

      <button onClick={connectToMuse} style={{ marginBottom: "20px" }}>
        Connect to Muse
      </button>

      <div>
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
