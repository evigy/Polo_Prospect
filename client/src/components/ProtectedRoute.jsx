// client/src/components/ProtectedRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) return null; // optionally render a spinner
  if (!isAuthenticated) return <Navigate to={redirectTo} replace />;

  return children;
}