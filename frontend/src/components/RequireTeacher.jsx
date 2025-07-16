import { Navigate } from 'react-router-dom';

const RequireTeacher = ({ children }) => {
  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const role = payload?.userRole;
  const allowed = role === 'teacher' || role === 'admin';
  return allowed ? children : <Navigate to="/" replace />;
};

export default RequireTeacher;
