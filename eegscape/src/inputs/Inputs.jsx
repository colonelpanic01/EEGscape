import React, { useState, useCallback } from "react";
import { MuseClient } from "muse-js";

export default function MuseConnectPage() {
  const [status, setStatus] = useState("Disconnected");

  const connectToMuse = async () => {
    try {
      setStatus("Connecting...");
      const museClient = new MuseClient();
      await museClient.connect();
      await museClient.start();
      setStatus("Connected");
      window.museClient = museClient;
    } catch (error) {
      console.error("Error connecting to Muse:", error);
      setStatus("Connection Failed");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>EEGscape</h1>
      <p>Status: {status}</p>

      <button onClick={connectToMuse} style={{ marginBottom: "20px" }}>
        Connect to Muse
      </button>
    </div>
  );
}
