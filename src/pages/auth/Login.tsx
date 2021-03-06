import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { signIn } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);

  const LoginSchema: SchemaOf<LoginFormInput> = object({
    username: string().required().label('Username'),
    password: string().required().label('Password'),
  });

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
  const formik = useFormik<LoginFormInput>({
    initialValues: {
      username: 'trungtm',
      password: 'abcd1234',
    },
    validationSchema: LoginSchema,
    onSubmit: async values => {
      // await sleep(5000);
      console.log('values', values);
      try {
        const response = await fetch('http://localhost:3001/auth/login', {
          method: 'POST',
          body: JSON.stringify(values),
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        const { user, accessToken }: IAuthContextProps = await response.json();

        signIn(user, accessToken);
        navigate('/', { replace: true });
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
