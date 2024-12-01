import React, { useState } from "react";
import { Provider, Contract } from "starknet";

const MoveCommand = () => {
  const [moveStatus, setMoveStatus] = useState("");

  // Hardcoded values
  const worldAddress = "0x0525177c8afe8680d7ad1da30ca183e482cfcd6404c1e09d83fd3fa2994fd4b8";
  const moveSelector = "0x7a1c71029f2d0b38e3ac89b09931d08b6e48417e079c289ff19a8698d0cba33";

  // Create a Starknet provider to interact with the network
  const provider = new Provider({ baseUrl: "http://localhost:5050/" });

  // Function to send the move command
  const sendMoveCommand = async (payload) => {
    try {
      // Create a contract instance without the ABI
      const contract = new Contract([], worldAddress, provider);

      // Send the move command to the contract with the payload
      await contract.invoke(moveSelector, payload);
      console.log("Move command successfully sent:", payload);
      setMoveStatus("Move command sent successfully.");
    } catch (error) {
      console.error("Error sending move command:", error);
      setMoveStatus(`Error: ${error.message || error}`);
    }
  };

  // Example payload for moving (customize as needed)
  const movePayload = { direction: "north", speed: 10 };

  return (
    <div>
      <button onClick={() => sendMoveCommand(movePayload)}>Send Move Command</button>
      <p>{moveStatus}</p>
    </div>
  );
};

export default MoveCommand;
