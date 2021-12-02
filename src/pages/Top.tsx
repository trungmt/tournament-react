import { useContext } from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import AuthContext from '../store/auth-context';

export function TopPage() {
  const { user } = useContext(AuthContext);
  return (
    <div>
      <Button variant="outlined" color="primary">
        Hello, {user.name}
      </Button>
      <Button variant="outlined" color="primary">
        <Link to="/admin">Admin page</Link>
      </Button>
    </div>
  );
}
