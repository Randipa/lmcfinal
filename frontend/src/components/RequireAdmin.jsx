import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAdmin = ({ children }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const isAdmin = payload?.userRole === 'admin';

  return isAdmin ? children : <Navigate to="/" replace />;
};

export default RequireAdmin;
