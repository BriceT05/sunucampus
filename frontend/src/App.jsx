import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ErrorBoundary from './components/ErrorBoundary';
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
        <Route path="dashboard"      element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="etudiants"      element={<ErrorBoundary><Etudiants /></ErrorBoundary>} />
        <Route path="etudiants/:id"  element={<ErrorBoundary><EtudiantDetail /></ErrorBoundary>} />
        <Route path="chambres"       element={<ErrorBoundary><Chambres /></ErrorBoundary>} />
        <Route path="attributions"   element={<ErrorBoundary><Attributions /></ErrorBoundary>} />
        <Route path="paiements"      element={<ErrorBoundary><Paiements /></ErrorBoundary>} />
        <Route path="incidents"      element={<ErrorBoundary><Incidents /></ErrorBoundary>} />
        <Route path="batiments"      element={<ErrorBoundary><Batiments /></ErrorBoundary>} />
      </Route>
    </Routes>
  );
}
