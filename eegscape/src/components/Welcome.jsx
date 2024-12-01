import { useEEG } from "../context/EEGContext";
import useReceiveEeg from "../hooks/useReceiveEeg";

function Welcome({ onContinue }) {
  const { nod } = useReceiveEeg();
  const { connectToMuse, configureDefaultPosition } = useEEG();

  nod.useNodBottom(() => {
    onContinue();
  });

  return (
    <div className="flex flex-col items-center space-y-6 p-8 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
        <p className="text-gray-700">
          Follow the instructions below to get started.
        </p>
      </div>

      <div className="space-y-4 text-gray-800 text-center">
        <p>Make sure your headset is powered on and ready to connect.</p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={connectToMuse}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition w-full"
        >
          Connect to Muse
        </button>
        <button
          onClick={configureDefaultPosition}
          className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-700 transition w-full"
        >
          Calibrate Position
        </button>
      </div>

      <div>
        <button
          onClick={onContinue}
          className="bg-indigo-500 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition"
        >
          Nod Your Head To Continue
        </button>
      </div>
    </div>
  );
}

export default Welcome;
