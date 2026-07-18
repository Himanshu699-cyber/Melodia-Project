import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadProfile } from './store/authSlice';
import type { RootState } from './store';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Library from './pages/Library';
import PlaylistGenerator from './pages/PlaylistGenerator';
import AIStudio from './pages/AIStudio';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import PlaylistDetails from './pages/PlaylistDetails';
import FullPlayer from './pages/FullPlayer';
import AdminDashboard from './pages/AdminDashboard';
import { dismissNotification } from './store/playlistSlice';

function App() {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state: RootState) => state.playlists);

  // Load user profile on startup if token exists
  useEffect(() => {
    dispatch(loadProfile() as any);
  }, [dispatch]);
   
  // Take the most recent unread notification as a toast
  const activeToast = notifications.filter(n => !n.read)[0];
   useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        dispatch(dismissNotification(activeToast.id));
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activeToast, dispatch]);
  return (
    <BrowserRouter>
      {/* Toast Notification Container */}
      {activeToast && (
  <div className="fixed top-6 right-6 z-[9999] max-w-sm bg-[#181818] border-l-4 border-primary text-white p-4 rounded shadow-[0_4px_30px_rgba(0,0,0,0.6)] flex items-start gap-md animate-slide-in select-none">
    <span className="material-symbols-outlined text-primary shrink-0">
      {activeToast.type === 'success' ? 'check_circle' : activeToast.type === 'error' ? 'error' : 'info'}
    </span>
    <div className="flex-grow">
      <p className="text-xs text-on-surface-variant font-mono">Notification</p>
      <p className="text-sm font-semibold mt-xs leading-snug">{activeToast.message}</p>
    </div>
    <button
      onClick={() => dispatch(dismissNotification(activeToast.id))}
      className="text-on-surface-variant hover:text-white transition-colors shrink-0"
    >
      <span className="material-symbols-outlined text-[18px]">close</span>
    </button>
  </div>
      )}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Dashboard/App Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <Search />
            </ProtectedRoute>
          }
        />
        <Route
          path="/library"
          element={
            <ProtectedRoute>
              <Library />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generator"
          element={
            <ProtectedRoute>
              <PlaylistGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/studio"
          element={
            <ProtectedRoute>
              <AIStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/playlist/:id"
          element={
            <ProtectedRoute>
              <PlaylistDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/player"
          element={
            <ProtectedRoute>
              <FullPlayer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
