import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../store/auth-context';

interface RequireAuthProps {
  children: JSX.Element;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { accessToken } = useContext(AuthContext);
  let location = useLocation();
  if (!accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  return children;
}
