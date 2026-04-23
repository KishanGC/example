import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage    from './pages/LandingPage';
import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DonorDashboard from './pages/DonorDashboard';
import NgoDashboard   from './pages/NgoDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MapPage        from './pages/MapPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Layout
import Navbar  from './components/Navbar';
import Spinner from './components/Spinner';

/* ───── Route guards ───── */
function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'ngo')   return <Navigate to="/ngo" replace />;
    return <Navigate to="/donor" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/map"      element={<MapPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Donor only */}
        <Route path="/donor" element={
          <PrivateRoute roles={['donor']}>
            <DonorDashboard />
          </PrivateRoute>
        } />

        {/* NGO only */}
        <Route path="/ngo" element={
          <PrivateRoute roles={['ngo']}>
            <NgoDashboard />
          </PrivateRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
