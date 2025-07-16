import { Navigate } from 'react-router-dom';

const RequireAssistant = ({ children }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const allowed = payload?.userRole === 'assistant' || payload?.userRole === 'admin';
  return allowed ? children : <Navigate to="/" replace />;
};

export default RequireAssistant;
