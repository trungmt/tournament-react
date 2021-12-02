import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import GamepadOutlinedIcon from '@mui/icons-material/GamepadOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export function MainNavigation() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const iconMenu: JSX.Element = (
    <div>
      <IconButton
        size="large"
        aria-label="account"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        color="inherit"
        onClick={handleMenu}
      >
        <AccountCircleIcon />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>
    </div>
  );

  return (
    <AppBar position="fixed">
      <Toolbar>
        <GamepadOutlinedIcon />
        <Typography
          variant="h6"
          sx={{
            marginLeft: 1,
            flexGrow: 1,
          }}
        >
          Tournaments
        </Typography>
        {iconMenu}
      </Toolbar>
    </AppBar>
  );
}
