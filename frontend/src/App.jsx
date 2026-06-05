import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Etudiants from './pages/Etudiants';
import EtudiantDetail from './pages/EtudiantDetail';
import Chambres from './pages/Chambres';
import Attributions from './pages/Attributions';
import Paiements from './pages/Paiements';
import Incidents from './pages/Incidents';
import Batiments from './pages/Batiments';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="etudiants"      element={<Etudiants />} />
        <Route path="etudiants/:id"  element={<EtudiantDetail />} />
        <Route path="chambres"       element={<Chambres />} />
        <Route path="attributions"   element={<Attributions />} />
        <Route path="paiements"      element={<Paiements />} />
        <Route path="incidents"      element={<Incidents />} />
        <Route path="batiments"      element={<Batiments />} />
      </Route>
    </Routes>
  );
}
