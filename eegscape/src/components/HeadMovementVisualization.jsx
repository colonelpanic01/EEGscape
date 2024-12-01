import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useEEG } from "../context/EEGContext";

const HeadMovementVisualization = () => {
  const sceneRef = useRef(null);
  const objectRef = useRef(null);
  const rendererRef = useRef(null);
  const {
    yawDegrees,
    pitchDegrees,
    museClient,
    defaultPositionAngle,
    defaultPosition,
  } = useEEG();

  useEffect(() => {
    // Clean up the previous scene if it exists
    if (sceneRef.current) {
      while (sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild);
      }
    }

    // Initialize Three.js scene, camera, renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0); // Transparent background
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create cube object
    const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const material = new THREE.MeshBasicMaterial({ color: 0xafe1af });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objectRef.current = cube;

    // Set camera position
    camera.position.z = 2;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up on component unmount
    return () => {
      if (scene) {
        scene.remove(cube);
        geometry.dispose();
        material.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  useEffect(() => {
    if (museClient) {
      museClient.accelerometerData.subscribe((data) => {
        if (data && Array.isArray(data.samples) && data.samples.length > 0) {
          const { x, y, z } = data.samples[0];

          const gVector = new THREE.Vector3(x, y, z);
          const xAxis = new THREE.Vector3(0, 1, 0);
          const yAxis = new THREE.Vector3(1, 0, 0);
          const yawAngle =
            Math.atan2(gVector.x, gVector.z) - defaultPositionAngle.yaw;
          console.log("yawAngle", yawAngle);
          const yawRotation = new THREE.Quaternion().setFromAxisAngle(
            yAxis,
            yawAngle
          );
          const pitchAngle =
            Math.atan2(gVector.y, gVector.z) - defaultPositionAngle.pitch;
          const pitchRotation = new THREE.Quaternion().setFromAxisAngle(
            xAxis,
            pitchAngle
          );
          const finalRotation = yawRotation.multiply(pitchRotation);

          if (objectRef.current) {
            objectRef.current.quaternion.copy(finalRotation);
          }
        } else {
          console.error("ruh ro, error in the accelommeter data:", data);
        }
      });
    }
  }, [yawDegrees, pitchDegrees, defaultPositionAngle]);
  console.log("CURRRENT YAW:", );
  console.log("DEFAULTTTTT YAW:", defaultPositionAngle.yaw);

  return (
    <div>
      <div ref={sceneRef} className="w-48 h-48" />
      <div className="text-white">
        <h3 className="font-bold">Head Movement Data:</h3>
        <p>
          Right/Left Tilt: {Math.round(pitchDegrees - defaultPosition.pitch)}°
        </p>
        <p>Up/Down Tilt: {Math.round(yawDegrees - defaultPosition.yaw)}°</p>
      </div>
    </div>
  );
};

export default HeadMovementVisualization;
