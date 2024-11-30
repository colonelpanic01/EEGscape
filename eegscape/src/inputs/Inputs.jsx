import { Line } from "react-chartjs-2";
import "chart.js/auto";
import useMuse from "../hooks/useMuse";

export default function MuseConnectPage() {
  const {
    channel,
    chartData,
    connectToMuse,
    degrees,
    metrics,
    sceneRef,
    status,
  } = useMuse();
  return (
    <>
      <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
        <h1>EEGscape</h1>
        <p>Status: {status.value}</p>

        <button onClick={connectToMuse} style={{ marginBottom: "20px" }}>
          Connect to Muse
        </button>

        {/* Dropdown for channel selection */}
        <div style={{ marginBottom: "20px" }}>
          <label htmlFor="channel-select" style={{ marginRight: "10px" }}>
            Select Channel:
          </label>
          <select
            id="channel-select"
            value={channel.selected}
            onChange={channel.handleChange}
            style={{ padding: "5px", fontSize: "16px" }}
          >
            <option value="0">Channel 0</option>
            <option value="1">Channel 1</option>
            <option value="2">Channel 2</option>
            <option value="3">Channel 3</option>
          </select>
        </div>

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

        {/* EEG Graph */}
        <div style={{ width: "500px", height: "400px" }}>
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: "Time" } },
                y: { title: { display: true, text: "Band Values" } },
              },
            }}
          />
        </div>

        {/* Head tracking stuff */}
        <div>
          <h3>Head Movement Data:</h3>
          <p>Right/Left Tilt: {degrees.pitch}°</p>
          <p>Up/Down Tilt: {degrees.yaw}°</p>
          {/* <p>Right/Left Tilt: {yawDegrees}°</p>
        <p>Up/Down Tilt: {pitchDegrees}°</p> */}
        </div>
      </div>
      <div ref={sceneRef} className="absolute top-0 right-0 bg-slate-800" />
    </>
  );
}
