import { PropsWithChildren } from 'react';
import { Card, Grid, Stack, Typography } from '@mui/material';

interface FormPartProps extends PropsWithChildren<{}> {
  formPartName: string;
}
export default function FormPart({ formPartName, children }: FormPartProps) {
  return (
    <Card sx={{ mb: 4 }}>
      <Grid container sx={{ px: 3, py: 4 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">{formPartName}</Typography>
        </Grid>
        <Grid item xs={12} md={8} sx={{ pt: { xs: 3, md: 0 } }}>
          <Stack>{children}</Stack>
        </Grid>
      </Grid>
    </Card>
  );
}
