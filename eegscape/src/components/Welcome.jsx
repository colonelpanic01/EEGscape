import { useEEG } from "../context/EEGContext";
import useReceiveEeg from "../hooks/useReceiveEeg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

function Welcome({ onContinue }) {
  const { nod } = useReceiveEeg();
  const { connectToMuse, configureDefaultPosition, status } = useEEG();

  nod.useNodBottom(() => {
    onContinue();
  });

  const isConnected = status !== "Disconnected";
  const isCalibrated = status === "Calibrated";

  return (
    <div className="flex flex-col items-center space-y-6 p-8 max-w-md mx-auto rounded-lg shadow-lg">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to eegscape!</h1>
        {/* <h2 className="text-3xl font-bold mb-4">Where your head can have fun without its </h2> */}
        <p className="">
          Before you can ✨ <strong>eegscape</strong> ✨ to our wonderful
          playland, connect your muse device and calibrate your head position.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={connectToMuse}
          className={`transition w-full btn ${
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
        {isConnected && (
          <button
            onClick={configureDefaultPosition}
            className={`transition w-full btn ${
              isCalibrated ? "btn-disabled" : ""
            } btn-primary`}
          >
            Calibrate Your Position
            {isCalibrated && (
              <FontAwesomeIcon
                className="text-success text-lg"
                icon={faCircleCheck}
              />
            )}
          </button>
        )}
      </div>

      <div>
        {isCalibrated && (
          <button
            onClick={onContinue}
            className="text-lg flex justify-center items-center gap-2"
          >
            <img
              src="https://img.icons8.com/?size=100&id=BGQDUMFak9MT&format=png&color=ffffff"
              className="w-10 h-10"
            ></img>
            Nod Your Head To Continue
          </button>
        )}
      </div>
    </div>
  );
}

export default Welcome;
