import {
  createContext,
  useState,
  useEffect,
  PropsWithChildren,
  useCallback,
} from 'react';

import { useNavigate } from 'react-router-dom';

interface IUser {
  name: string;
  username: string;
}
export interface IAuthContextProps {
  user: IUser;
  accessToken: string;
}

interface IAuthContext extends IAuthContextProps {
  signIn(user: IUser, accessToken: string): void;
  setAccessToken(accessToken: string): void;
  refresh(): Promise<void>;
}

interface AuthContextProviderProps extends PropsWithChildren<{}> {}

const initialAuthState: IAuthContext = {
  accessToken: '',
  user: {
    name: '',
    username: '',
  },
  signIn: (user, accessToken) => {},
  setAccessToken: accessToken => {},
  refresh: async () => {},
};

const AuthContext = createContext<IAuthContext>(initialAuthState);

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [authState, setAuthState] = useState<IAuthContext>(initialAuthState);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        signIn(initialAuthState.user, initialAuthState.accessToken);
        navigate('/admin/login');
        return;
      }

      const { user, accessToken }: IAuthContextProps = await response.json();
      console.log('new token', accessToken);
      signIn(user, accessToken);
    } catch (error) {
      console.log(typeof error);
    }
  }, [navigate]);

  const signIn = (user: IUser, accessToken: string) => {
    setAuthState(prevAuthState => ({
      ...prevAuthState,
      user,
      accessToken,
    }));
  };

  const setAccessToken = (accessToken: string) => {
    setAuthState(prevAuthState => ({
      ...prevAuthState,
      accessToken,
    }));
  };

  useEffect(() => {
    if (authState.accessToken === initialAuthState.accessToken) {
      refresh();
      return;
    }
    const interval = setInterval(() => {
      refresh();
    }, 5000);

    console.log('start interval', interval);
    return function cleanup() {
      console.log('clear interval', interval);
      clearInterval(interval);
    };
  }, [authState.accessToken, refresh]);

  const context: IAuthContext = {
    ...authState,
    signIn,
    setAccessToken,
    refresh,
  };

  return (
    <AuthContext.Provider value={context}>
      {props.children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
