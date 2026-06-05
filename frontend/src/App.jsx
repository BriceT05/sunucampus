import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
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

function WrappedRoute({ element }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{element}</ErrorBoundary>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<WrappedRoute element={<Dashboard />} />} />
        <Route path="etudiants"      element={<WrappedRoute element={<Etudiants />} />} />
        <Route path="etudiants/:id"  element={<WrappedRoute element={<EtudiantDetail />} />} />
        <Route path="chambres"       element={<WrappedRoute element={<Chambres />} />} />
        <Route path="attributions"   element={<WrappedRoute element={<Attributions />} />} />
        <Route path="paiements"      element={<WrappedRoute element={<Paiements />} />} />
        <Route path="incidents"      element={<WrappedRoute element={<Incidents />} />} />
        <Route path="batiments"      element={<WrappedRoute element={<Batiments />} />} />
      </Route>
    </Routes>
  );
}
