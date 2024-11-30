import React, { useState, useEffect, useRef } from "react";
import { MuseClient, zipSamples } from "muse-js";
import { epoch, fft, powerByBand } from "@neurosity/pipes";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";

export default function MuseConnectPage() {
  const [status, setStatus] = useState("Disconnected");
  const [selectedChannel, setSelectedChannel] = useState(0);
  const [chartData, setChartData] = useState({
    labels: ["Delta", "Theta", "Alpha", "Beta", "Gamma"],
    datasets: [
      {
        label: "EEG Bands",
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"],
        data: [0, 0, 0, 0, 0], // Initial empty data
      },
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

      zipSamples(museClient.eegReadings)
        .pipe(
          epoch({ duration: 1024, interval: 250, samplingRate: 256 }),
          fft({ bins: 256 }),
          powerByBand()
        )
        .subscribe((data) => {
          const channelData = [
            data.delta[selectedChannel],
            data.theta[selectedChannel],
            data.alpha[selectedChannel],
            data.beta[selectedChannel],
            data.gamma[selectedChannel],
          ];
          updateChartData(channelData);
        });
    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
  };

  const updateChartData = (channelData) => {
    setChartData((prevData) => ({
      ...prevData,
      datasets: [
        {
          ...prevData.datasets[0],
          data: channelData,
        },
      ],
    }));
  };

  const handleChannelChange = (channelIndex) => {
    setSelectedChannel(channelIndex);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>EEGscape</h1>
      <p>Status: {status}</p>

      <button onClick={connectToMuse} style={{ marginBottom: "20px" }}>
        Connect to Muse
      </button>

      <div style={{ marginBottom: "20px" }}>
        <h3>Select Channel:</h3>
        {[0, 1, 2, 3].map((channel) => (
          <button
            key={channel}
            onClick={() => handleChannelChange(channel)}
            style={{
              marginRight: "10px",
              padding: "10px",
              backgroundColor: selectedChannel === channel ? "#007bff" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Channel {channel}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "600px", margin: "auto" }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
