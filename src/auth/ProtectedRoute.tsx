import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

type ProtectedRouteProps = {
  children: JSX.Element;
  allowedRoles: string[];
};

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" />;

  if (!allowedRoles.includes(user.user_type)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default ProtectedRoute;
