import { Box, Grid } from '@mui/material';
import { PropsWithChildren } from 'react-transition-group/node_modules/@types/react';
import { MainNavigation, LeftSideBar } from './index';

interface AdminLayoutProps extends PropsWithChildren<{}> {}
export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Box flexGrow={1}>
      <MainNavigation />
      <Grid container spacing={0}>
        <Grid item xs={2} sm={3} md={2}>
          <LeftSideBar />
        </Grid>
        <Grid item xs={10} sm={9} md={10}>
          <Box sx={{ paddingTop: { xs: 6, sm: 7, md: 8 } }}>{children}</Box>
        </Grid>
      </Grid>
    </Box>
  );
}
