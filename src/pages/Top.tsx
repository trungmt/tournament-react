import { useContext } from 'react';
import { Button } from '@mui/material';
import AuthContext from '../store/auth-context';

export function TopPage() {
  const { user } = useContext(AuthContext);
  return (
    <Button variant="outlined" color="primary">
      Hello, {user.name}
    </Button>
  );
}
