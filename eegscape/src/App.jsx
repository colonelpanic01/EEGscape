import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Inputs from "./inputs/Inputs";
import { EEGProvider } from "./context/EEGContext";
import { useEffect } from "react";
import MockEegEmitter from "./components/MockEegEmitter";
import EEGEmitter from "./components/EEGEmitter";
import Metrics from "./components/Metrics";

function App() {
  useEffect(() => {}, []);
  return (
    <>
      <EEGProvider>
        <EEGEmitter />
        <MockEegEmitter />
        <Metrics />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/inputs" element={<Inputs />} />
          </Routes>
        </BrowserRouter>
        {/* <EegInputDisplay /> */}
      </EEGProvider>
    </>
  );
}

export default App;
