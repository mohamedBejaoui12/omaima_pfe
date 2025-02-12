import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

function ProtectedRoute({ children, allowedRoles }) {
  const token = Cookies.get('token');
  const location = useLocation();
  const navigate = useNavigate();

  // Get user from cookies
  const user = token ? JSON.parse(Cookies.get('user')) : null;

  useEffect(() => {
    // Prevent unauthorized access via browser navigation
    const handlePopstate = () => {
      if (!token || !user || !allowedRoles.includes(user.role)) {
        // Redirect to login if no token, no user, or unauthorized role
        navigate('/login', { 
          state: { from: location }, 
          replace: true 
        });
      }
    };

    window.addEventListener('popstate', handlePopstate);

    return () => {
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [token, user, location, navigate, allowedRoles]);

  // Check token, user existence, and role authorization
  if (!token || !user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;