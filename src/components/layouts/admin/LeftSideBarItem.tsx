import { Typography, ListItemButton } from '@mui/material';
import { blue } from '@mui/material/colors';
import { styled } from '@mui/system';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { forwardRef, useMemo } from 'react';

export interface LeftSideBarItemProps {
  icon: JSX.Element;
  title: string;
  path: string;
}

export default function LeftSideBarItem({
  icon,
  title,
  path,
}: LeftSideBarItemProps) {
  const renderLink = useMemo(
    () =>
      forwardRef<HTMLAnchorElement, Omit<RouterLinkProps, 'to'>>(function Link(
        itemProps,
        ref
      ) {
        return (
          <RouterLink to={path} ref={ref} {...itemProps} role={undefined} />
        );
      }),
    [path]
  );

  const ItemTextStyle = styled(Typography)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    fontWeight: 300,
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  }));

  return (
    <ListItemButton
      component={renderLink}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: { xs: 'center', sm: 'flex-start' },
        alignItems: 'self-start',
        p: 2,
        pl: { md: 3 },
        pr: { md: 2.5 },
        '&:hover': {
          backgroundColor: blue[50],
        },
      }}
    >
      {icon}
      <ItemTextStyle>{title}</ItemTextStyle>
    </ListItemButton>
  );
}
