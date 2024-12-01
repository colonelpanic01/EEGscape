import { Provider, Contract } from "starknet";

// Load the manifest and get the contract address and systems
const { world_address, systems } = require('./path-to-manifest_dev.json');

// Create a Starknet provider
const provider = new Provider({ baseUrl: "http://localhost:5050" });

// Function to send commands to the Dojo world (invoking systems like move)
const sendCommand = async (system, payload) => {
  try {
    // Find the selector for the system (like move, upgrade)
    const systemSelector = systems.find(s => s.tag === `dojo_starter-${system}`)?.selector;

    if (!systemSelector) {
      console.error(`System ${system} not found in the manifest.`);
      return;
    }

    // Create a contract instance without the ABI
    const contract = new Contract([], world_address, provider);

    // Invoke the system's selector with the payload
    await contract.invoke(systemSelector, payload);
    console.log(`Successfully invoked ${system}`);
  } catch (error) {
    console.error(`Error invoking ${system}:`, error);
  }
};

// Example usage to move (with sample payload)
const movePayload = { direction: 'north', speed: 10 };  // Customize payload based on the action
sendCommand('move', movePayload);
