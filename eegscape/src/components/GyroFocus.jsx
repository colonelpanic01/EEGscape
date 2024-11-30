import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const GyroFocus = ({ setActiveComponent }) => {
    const { tilt } = useReceiveEeg();
    const [pitchValue, setPitchValue] = useState(null);

    tilt.useTilt((newPitch) => {
        setPitchValue(newPitch);
        console.log(`Yaw: ${newPitch}`);
    });

    const handleShowPitch = () => {
        console.log(`Current pitch: ${pitchValue ?? 'Not available'}`);
    };

    return (
        <div className="flex flex-col items-center space-y-6 p-8 max-w-md mx-auto bg-gray-100 rounded-lg shadow-lg">
            <div>
                <p>Example text</p>
                <p>Current Yaw: {pitchValue !== null ? pitchValue : 'Not available'}</p>
            </div>
            <div>
                <button
                    onClick={handleShowPitch}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Click to show pitch in console
                </button>
            </div>
        </div>
    );
};

export default GyroFocus;