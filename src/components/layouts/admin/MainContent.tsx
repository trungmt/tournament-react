import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Add as AddIcon } from '@mui/icons-material';
import { Button, Card, Container, Stack } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface MainContentProps extends PropsWithChildren<{}> {
  pageName: string;
  wrappedWithCard?: boolean;
  addButtonLink?: string;
}

export function AdminMainContent({
  children,
  pageName,
  addButtonLink,
  wrappedWithCard = true,
}: MainContentProps) {
  let content = children;
  if (wrappedWithCard === true) {
    content = <Card sx={{ mb: 6 }}>{content}</Card>;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Container maxWidth="lg">
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
              Add
            </Button>
          )}
        </Stack>

        {content}
      </Container>
    </Box>
  );
}
