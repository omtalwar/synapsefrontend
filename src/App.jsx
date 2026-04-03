import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoadingScreen from './components/layout/LoadingScreen';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import InsightsPage from './pages/InsightsPage';
import IdeaDetailPage from './pages/IdeaDetailPage';
import GraphPage from './pages/GraphPage';
import ProfilePage from './pages/ProfilePage';
import ComparePage from './pages/ComparePage';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
          <Route path="/ideas/:id" element={<ProtectedRoute><IdeaDetailPage /></ProtectedRoute>} />
          <Route path="/graph" element={<ProtectedRoute><GraphPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          <Route path="/compare" element={<ProtectedRoute><ComparePage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
