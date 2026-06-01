import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import Incidents from './pages/Incidents';
import Reports from './pages/Reports';
import Geofences from './pages/Geofences';
import Users from './pages/Users';
import Schools from './pages/Schools';
import Alerts from './pages/Alerts';
import UserDashboard from './pages/UserDashboard';
import AgencyRegister from './pages/AgencyRegister';
import AgencyDashboard from './pages/AgencyDashboard';

function AdminLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/geofences" element={<Geofences />} />
          <Route path="/schools" element={<Schools />} />
          <Route path="/users" element={<Users />} />
          <Route path="/alerts" element={<Alerts />} />
        </Routes>
      </main>
    </div>
  );
}

function AppRoutes() {
  const location = useLocation();
  const p = location.pathname;
  if (p.startsWith('/report'))           return <Routes><Route path="/report" element={<UserDashboard />} /></Routes>;
  if (p.startsWith('/agency/register'))  return <Routes><Route path="/agency/register" element={<AgencyRegister />} /></Routes>;
  if (p.startsWith('/agency/dashboard')) return <Routes><Route path="/agency/dashboard" element={<AgencyDashboard />} /></Routes>;
  return <AdminLayout />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
