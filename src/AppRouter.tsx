import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Stops from "./pages/stops/stops";
import StopDetail from "./pages/stops/stopDetail";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/stops/" element={<Stops />} />
        <Route path="/stops/:id" element={<StopDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
