import { useEEG } from "../context/EEGContext";
import useReceiveEeg from "../hooks/useReceiveEeg";

function Welcome({ onContinue }) {
  const { nod } = useReceiveEeg();
  const { connectToMuse } = useEEG();

  nod.useNodBottom(() => {
    onContinue();
  });

  return (
    <div className="flex flex-col items-center space-y-8 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
      </div>

      <div className="space-y-4">
        <p>This line will have instructions on connecting the headset</p>
      </div>

      <button onClick={connectToMuse}>Connect to Muse</button>

      <div>
        <button
          onClick={onContinue}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Nod Your Head To Continue
        </button>
      </div>
    </div>
  );
}

export default Welcome;
