import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store'; // Adjust path if your store is located elsewhere

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { token } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // 🛡️ BREAK THE REDIRECT LOOP HERE:
  // If there is no token, but they are already on /login or /signup, just render the page!
  if (!token) {
    if (location.pathname === '/login' || location.pathname === '/signup') {
      return <>{children}</>;
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
