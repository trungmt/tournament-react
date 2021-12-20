import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';
import { Button, Container, Divider, Stack, Typography } from '@mui/material';
import GamepadOutlinedIcon from '@mui/icons-material/GamepadOutlined';
import { forwardRef, useMemo } from 'react';

interface NotFoundPageProps {
  additionalMessage?: string;
  redirectUrl?: string;
  redirectLabel?: string;
}

interface LinkButtonProps {
  redirectUrl: string;
  redirectLabel: string;
}
function LinkButton({ redirectUrl, redirectLabel }: LinkButtonProps) {
  const LinkBehavior = useMemo(
    () =>
      forwardRef<any, Omit<RouterLinkProps, 'to'>>((props, ref) => (
        <RouterLink ref={ref} to={redirectUrl} {...props} role={undefined} />
      )),
    [redirectUrl]
  );
  return (
    <Button variant="text" component={LinkBehavior}>
      {redirectLabel}
    </Button>
  );
}

export function NotFoundPage({
  additionalMessage,
  redirectLabel,
  redirectUrl,
}: NotFoundPageProps) {
  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h3" textAlign="center" color="primary">
        The page you're looking for isn't here.
      </Typography>
      <Divider sx={{ my: 1 }}>
        <GamepadOutlinedIcon />
      </Divider>
      <Typography textAlign="center">
        You may have mistyped the address or the page may have moved.
      </Typography>
      {additionalMessage && (
        <Typography textAlign="center">{additionalMessage}</Typography>
      )}
      {redirectUrl && redirectLabel && (
        <Stack direction="row" justifyContent="center">
          <LinkButton redirectLabel={redirectLabel} redirectUrl={redirectUrl} />
        </Stack>
      )}
    </Container>
  );
}
