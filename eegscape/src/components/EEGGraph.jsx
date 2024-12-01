import React, { useEffect, useRef } from "react";
import { useEEG } from "../context/EEGContext";
import Chart from "chart.js/auto";

const EEGGraph = () => {
  const { metrics, chartData } = useEEG();
  const chartRef = useRef(null); // Reference to the canvas

  useEffect(() => {
    // Initialize the chart after the component mounts
    const ctx = chartRef.current.getContext("2d");

    const chart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            title: {
              display: true,
              text: "Time",
            },
          },
          y: {
            title: {
              display: true,
              text: "Band Values",
            },
          },
        },
      },
    });

    // Cleanup the chart on component unmount
    return () => {
      chart.destroy();
    };
  }, [chartData]);

  return (
    <div className="flex-grow h-full">
      {/* Chart Section */}
      <div className="w-full h-full">
          <canvas ref={chartRef}/>
        </div>
    </div>
  );
};

export default EEGGraph;