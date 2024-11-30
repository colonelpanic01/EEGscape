import React, { useState, useEffect } from 'react';
import { MuseClient } from 'muse-js';

const MuseBlockController = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [position, setPosition] = useState(50); // Initial block position (percentage)
  const [museClient, setMuseClient] = useState(null);

  useEffect(() => {
    const client = new MuseClient();
    setMuseClient(client);

    const connectToMuse = async () => {
      try {
        await client.connect();
        await client.start();
        setIsConnected(true);

        // Example EEG subscription: Adjust position based on alpha band power
        client.eegReadings.subscribe((reading) => {
          const signalValue = reading.electrode; // Replace with actual signal processing
          const newPos = Math.min(100, Math.max(0, position + signalValue)); // Keep position within 0-100%
          setPosition(newPos);
        });
      } catch (error) {
        console.error('Failed to connect to Muse:', error);
      }
    };

    connectToMuse();

    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <h1>Muse-Controlled Block</h1>
      <p>{isConnected ? 'Connected to Muse!' : 'Not connected'}</p>
      <div
        style={{
          position: 'relative',
          width: '300px',
          height: '300px',
          backgroundColor: '#ddd',
          border: '1px solid #ccc',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${position}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '50px',
            height: '50px',
            backgroundColor: '#007BFF',
            borderRadius: '5px',
          }}
        ></div>
      </div>
    </div>
  );
};

export default MuseBlockController;