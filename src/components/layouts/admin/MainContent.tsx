import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Add as AddIcon } from '@mui/icons-material';
import { Button, Card, Container, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface MainContentProps extends PropsWithChildren<{}> {
  pageName: string;
  addButtonLink?: string;
}

export function AdminMainContent({
  children,
  pageName,
  addButtonLink,
}: MainContentProps) {
  return (
    <Box sx={{ width: '100%' }}>
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          my={5}
        >
          <Typography variant="h4" gutterBottom>
            {pageName}
          </Typography>
          {addButtonLink && (
            <Button
              variant="contained"
              component={RouterLink}
              to={addButtonLink}
              startIcon={<AddIcon />}
            >
              New Team
            </Button>
          )}
        </Stack>
        <Card sx={{ mb: 6 }}>{children}</Card>
      </Container>
    </Box>
  );
}
