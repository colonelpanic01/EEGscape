import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Inputs from "./inputs/Inputs";
import { EEGProvider } from './context/EEGContext';
import { useEffect } from "react";
import MockEegEmitter from "./components/MockEegEmitter";
import EegInputDisplay from "./components/EegInputDisplay";
import TowerStack from "./pages/TowerStack";
import EEGEmitter from "./components/EEGEmitter";

function App() {
  useEffect(() => {}, []);
  return (
    <>
    <EEGProvider>
      <EEGEmitter />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
            <Route path="/inputs" element={<Inputs />} />
          <Route path="/tower-stack" element={<TowerStack />} />
        </Routes>
      </BrowserRouter>
      <EegInputDisplay />
    </EEGProvider>

    </>
  );
}

export default App;
