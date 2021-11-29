import { useContext } from 'react';
import { Button } from '@mui/material';
import AuthContext from '../store/auth-context';

export function TopPage() {
  const { user } = useContext(AuthContext);
  return (
    <div>
      <Button variant="outlined" color="primary">
        Hello, {user.name}
      </Button>
    </div>
  );
}
