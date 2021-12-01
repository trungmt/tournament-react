import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../store/auth-context';
import FakeProgress from '../ui/FakeProgress';

interface RequireAuthProps {
  children: JSX.Element;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { accessToken, isLogout } = useContext(AuthContext);
  let location = useLocation();
  if (!accessToken && isLogout === true) {
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  if (!accessToken && isLogout === false) {
    return <FakeProgress />;
  }

  return children;
}
