import { useState, useEffect, useCallback } from "react";
import useReceiveEeg from "../hooks/useReceiveEeg";

const GyroFocus = ({ setActiveComponent }) => {
    const { concentration, nod, tilt } = useReceiveEeg();
    const [yawValue, setYawValue] = useState(null);

    tilt.useTilt((newYaw) => {
        setYawValue(newYaw);
        console.log(`Yaw: ${newYaw}`);
    });

    const handleShowYaw = () => {
        console.log(`Current Yaw: ${yawValue ?? 'Not available'}`);
    };

    return (
        <div>
            <div>
                <p>Example text</p>
                <p>Current Yaw: {yawValue !== null ? yawValue : 'Not available'}</p>
            </div>
            <div>
                <button
                    onClick={handleShowYaw}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                >
                    Click to show yaw in console
                </button>
            </div>
        </div>
    );
};

export default GyroFocus;