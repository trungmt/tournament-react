import { Box, Grid } from '@mui/material';
import { PropsWithChildren } from 'react-transition-group/node_modules/@types/react';
import { MainNavigation, LeftSideBar, MainContent } from './index';

interface AdminLayoutProps extends PropsWithChildren<{}> {}
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box flexGrow={1}>
      <MainNavigation />
      <Grid container sx={{ paddingTop: 8 }}>
        <Grid item sm={3} md={2}>
          <LeftSideBar />
        </Grid>
        <Grid item sm={9} md={10}>
          {children}
        </Grid>
      </Grid>
    </Box>
  );
}
