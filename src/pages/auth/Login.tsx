import { useState, useContext } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Container,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { styled } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useFormik, Form, FormikProvider } from 'formik';
import { SchemaOf, object, string } from 'yup';
import AuthContext, { IAuthContextProps } from '../../store/auth-context';
import { axiosAuthClient } from '../../config/axios';
import constants from '../../config/constants';

interface LoginFormInput {
  username: string;
  password: string;
}
const ContentStyle = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  display: 'flex',
  minHeight: '100vh',
  height: 'auto',
  flexDirection: 'column',
  justifyContent: 'center',
}));

export function LoginPage() {
  const navigate = useNavigate();
  let location = useLocation();

  let from = location.state?.from?.pathname || '/';
  const { setAuth, isLogout } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema: SchemaOf<LoginFormInput> = object({
    username: string().required().label('Username'),
    password: string().required().label('Password'),
  });

  const formik = useFormik<LoginFormInput>({
    initialValues: {
      username: 'trungtm',
      password: 'abcd1234',
    },
    validationSchema: LoginSchema,
    onSubmit: async loginForm => {
      try {
        const response = await axiosAuthClient.post('/login', loginForm);
        const { user, accessToken }: IAuthContextProps = await response.data;

        setAuth(user, accessToken);
        navigate(from, { replace: true });
      } catch (error) {
        // TODO: handler error the right way
        alert('Error occurs when login! check console for more details');
        console.log('Login Error', error);
      }
    },
  });

  const { errors, touched, isSubmitting, handleSubmit, getFieldProps } = formik;

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (isLogout === false) {
    return <Navigate to={from} replace />;
  }

  return (
    <Container maxWidth="sm" className="container">
      <ContentStyle>
        <Typography variant="h5" mb={5} fontWeight={500} textAlign="center">
          Sign In
        </Typography>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Username"
                fullWidth
                type="text"
                {...getFieldProps('username')}
                error={Boolean(touched.username && errors.username)}
                helperText={touched.username && errors.username}
              />

              <TextField
                label="Password"
                fullWidth
                type={showPassword ? 'text' : 'password'}
                {...getFieldProps('password')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        // onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                error={Boolean(touched.password && errors.password)}
                helperText={touched.password && errors.password}
              />
              <LoadingButton
                variant="contained"
                fullWidth
                type="submit"
                size="large"
                loading={isSubmitting}
              >
                Login
              </LoadingButton>
            </Stack>
          </Form>
        </FormikProvider>
      </ContentStyle>
    </Container>
  );
}
