import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouterAPlaceholder from "./interfaces/router-a/Placeholder";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/router-a" replace />} />
        <Route path="/router-a" element={<RouterAPlaceholder />} />
        <Route path="/router-b" element={<div className="p-8">Router B — TBD</div>} />
        <Route path="/router-c" element={<div className="p-8">Router C — TBD</div>} />
        <Route path="/router-d" element={<div className="p-8">Router D — TBD</div>} />
      </Routes>
    </BrowserRouter>
  );
}