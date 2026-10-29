import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import RouterAApp from "./interfaces/router-a/RouterAApp";
import WirelessBasicPage from "./interfaces/router-a/pages/WirelessBasicPage";
import WirelessSecurityPage from "./interfaces/router-a/pages/WirelessSecurityPage";
import LanPage from "./interfaces/router-a/pages/LanPage";
import RouterBApp from "./interfaces/router-b/RouterBApp";
import DashboardB from "./interfaces/router-b/pages/Dashboard";

import RouterCApp from "./interfaces/router-c/RouterCApp";
import WlanPage from "./interfaces/router-c/pages/WlanPage";
import SecurityPage from "./interfaces/router-c/pages/SecurityPage";
import InterfacePage from "./interfaces/router-c/pages/InterfacePage";

import ConnectedDevicesPage from "./interfaces/router-a/pages/ConnectedDevicesPage";
import ClientsPage from "./interfaces/router-c/pages/ClientsPage";



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/router-b" replace />} />

        <Route path="/router-a" element={<RouterAApp />}>
          <Route index element={<Navigate to="wireless/basic" replace />} />
          <Route path="wireless/basic" element={<WirelessBasicPage />} />
          <Route path="wireless/security" element={<WirelessSecurityPage />} />
          <Route path="lan" element={<LanPage />} />
          <Route path="status/devices" element={<ConnectedDevicesPage />} />

        </Route>

        <Route path="/router-b" element={<RouterBApp />}>
          <Route index element={<DashboardB />} />
        </Route>

        <Route path="/router-c" element={<div className="p-8">Router C — TBD</div>} />
        <Route path="/router-d" element={<div className="p-8">Router D — TBD</div>} />

        <Route path="/router-c" element={<RouterCApp />}>
          <Route index element={<Navigate to="wlan" replace />} />
          <Route path="wlan" element={<WlanPage />} />
          <Route path="security" element={<SecurityPage />} />
          <Route path="interface" element={<InterfacePage />} />
          <Route path="clients" element={<ClientsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}