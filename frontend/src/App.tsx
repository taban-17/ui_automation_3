import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouterAApp from "./interfaces/router-a/RouterAApp";
import WirelessBasicPage from "./interfaces/router-a/pages/WirelessBasicPage";
import WirelessSecurityPage from "./interfaces/router-a/pages/WirelessSecurityPage";
import LanPage from "./interfaces/router-a/pages/LanPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/router-a" replace />} />
        <Route path="/router-a" element={<RouterAApp />}>
          <Route index element={<Navigate to="wireless/basic" replace />} />
          <Route path="wireless/basic" element={<WirelessBasicPage />} />
          <Route path="wireless/security" element={<WirelessSecurityPage />} />
          <Route path="lan" element={<LanPage />} />
        </Route>
        <Route path="/router-b" element={<div className="p-8">Router B — TBD</div>} />
        <Route path="/router-c" element={<div className="p-8">Router C — TBD</div>} />
        <Route path="/router-d" element={<div className="p-8">Router D — TBD</div>} />
      </Routes>
    </BrowserRouter>
  );
}