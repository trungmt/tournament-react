import PropTypes from 'prop-types';
import { PropsWithChildren, useMemo } from 'react';
// material
import { CssBaseline, GlobalStyles, ThemeOptions } from '@mui/material';
import {
  ThemeProvider,
  createTheme,
  StyledEngineProvider,
  Theme,
} from '@mui/material/styles';
//
import shape from './shape';
import palette from './palette';
import typography from './typography';
import breakpoints from './breakpoints';
import componentsOverride from './overrides';
import shadows, { customShadows } from './shadows';

import { CustomShadows } from './shadows';

// ----------------------------------------------------------------------

ThemeConfig.propTypes = {
  children: PropTypes.node,
};

export interface CustomTheme extends Theme {
  customShadows: CustomShadows;
}

declare module '@mui/material/styles' {
  interface Theme {
    customShadows: CustomShadows;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
}

interface ThemeConfigProps extends PropsWithChildren<{}> {}
export default function ThemeConfig({ children }: ThemeConfigProps) {
  const themeOptions: ThemeOptions = useMemo(
    () => ({
      palette,
      shape,
      typography,
      breakpoints,
      shadows,
      customShadows,
    }),
    []
  );

  const theme = createTheme(themeOptions);
  theme.components = componentsOverride(theme);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={theme => ({
            '*': {
              margin: 0,
              padding: 0,
              boxSizing: 'border-box',
            },
            html: {
              width: '100%',
              height: '100%',
              msTextSizeAdjust: '100%',
              WebkitOverflowScrolling: 'touch',
            },
            body: {
              width: '100%',
              height: '100%',
            },
            '#root': {
              width: '100%',
              height: '100%',
            },
            input: {
              '&[type=number]': {
                MozAppearance: 'textfield',
                '&::-webkit-outer-spin-button': {
                  margin: 0,
                  WebkitAppearance: 'none',
                },
                '&::-webkit-inner-spin-button': {
                  margin: 0,
                  WebkitAppearance: 'none',
                },
              },
            },
            textarea: {
              '&::-webkit-input-placeholder': {
                color: (theme as Theme).palette.text.disabled,
              },
              '&::-moz-placeholder': {
                opacity: 1,
                color: (theme as Theme).palette.text.disabled,
              },
              '&:-ms-input-placeholder': {
                color: (theme as Theme).palette.text.disabled,
              },
              '&::placeholder': {
                color: (theme as Theme).palette.text.disabled,
              },
            },
            a: { color: (theme as Theme).palette.primary.main },
            img: { display: 'block', maxWidth: '100%' },
          })}
        />
        {children}
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
