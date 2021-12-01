import { CircularProgress, LinearProgress } from '@mui/material';
import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthContext from '../../store/auth-context';

interface RequireAuthProps {
  children: JSX.Element;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { accessToken, isLogout } = useContext(AuthContext);
  let location = useLocation();
  if (!accessToken && isLogout === true) {
    return <Navigate to="/admin/login" state={{ from: location }} />;
  }

  if (!accessToken && isLogout === false) {
    return <LinearProgress sx={{ margin: '0 auto' }} />;
  }

  return children;
}
