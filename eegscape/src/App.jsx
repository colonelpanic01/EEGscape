import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import { useEffect } from "react";
import MockEegEmitter from "./components/MockEegEmitter";
import EegInputDisplay from "./components/EegInputDisplay";
import TowerStack from "./pages/TowerStack";

function App() {
  useEffect(() => {}, []);
  return (
    <>
      <MockEegEmitter />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tower-stack" element={<TowerStack />} />
        </Routes>
      </BrowserRouter>
      <EegInputDisplay />
    </>
  );
}

export default App;
