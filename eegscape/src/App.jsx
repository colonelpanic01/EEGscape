import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/Home";
import Inputs from "./inputs/Inputs";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/inputs" element={<Inputs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
