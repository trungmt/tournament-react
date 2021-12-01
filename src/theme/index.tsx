import { PropsWithChildren } from 'react';
import { CssBaseline } from '@mui/material';
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
} from '@mui/material/styles';

interface ThemeConfigProps extends PropsWithChildren<{}> {}
export default function ThemeConfig({ children }: ThemeConfigProps) {
  const themeOptions = {
    palette: {
      type: 'light',
      primary: {
        main: '#03A9F4',
        contrastText: 'rgba(255,255,255,0.87)',
      },
      secondary: {
        main: '#f50057',
      },
    },
    shape: {
      borderRadius: 4,
    },
    overrides: {
      MuiAppBar: {
        colorInherit: {
          backgroundColor: '#689f38',
          color: '#fff',
        },
      },
    },
  };

  const theme = createTheme(themeOptions);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
