import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Inputs from "./inputs/Inputs";
import { EEGProvider } from "./context/EEGContext";
import { useEffect } from "react";
import MockEegEmitter from "./components/MockEegEmitter";
import EEGEmitter from "./components/EEGEmitter";
import Metrics from "./components/Metrics";
import MoveCommand from "./utils/MoveCommand";

function App() {
  useEffect(() => {}, []);

  return (
    <EEGProvider> {/* Wrap the app with EEGProvider to give context to components */}
      {/* Render other components */}
      <h1>Dojo Move Command Example</h1>
      <MoveCommand />
      {/* <MockEegEmitter />
      <EEGEmitter />
      <Metrics /> */}
      
      {/* Add routing if needed */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/inputs" element={<Inputs />} />
        </Routes>
      </BrowserRouter>
    </EEGProvider>
  );
}

export default App;
