import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useEEG } from "../context/EEGContext";

const HeadMovementVisualization = () => {
  const sceneRef = useRef(null);
  const objectRef = useRef(null);
  const rendererRef = useRef(null);
  const { yawDegrees, pitchDegrees } = useEEG();

  useEffect(() => {
    if (sceneRef.current) {
      while (sceneRef.current.firstChild) {
        sceneRef.current.removeChild(sceneRef.current.firstChild);
      }
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    sceneRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const geometry = new THREE.BoxGeometry(0.75, 0.75, 0.75);
    const material = new THREE.MeshBasicMaterial({ color: 0xafe1af });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objectRef.current = cube;
    camera.position.z = 2;

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

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

  return (
    <div>
      <div ref={sceneRef} className="w-48 h-48" />
      <div className=" text-white">
        <h3 className="font-bold">Head Movement Data:</h3>
        <p>Right/Left Tilt: {pitchDegrees}°</p>
        <p>Up/Down Tilt: {yawDegrees}°</p>
      </div>
    </div>
  );
};

export default HeadMovementVisualization;
