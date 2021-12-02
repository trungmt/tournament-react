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
  isLogout: boolean;
  user: IUser;
  accessToken: string;
}

interface IAuthContext extends IAuthContextProps {
  setAuth(user: IUser, accessToken: string, isLogout?: boolean): void;
  setAccessToken(accessToken: string): void;
  refresh(): Promise<void>;
}

interface AuthContextProviderProps extends PropsWithChildren<{}> {}

const initialAuthState: IAuthContext = {
  isLogout: false,
  accessToken: '',
  user: {
    name: '',
    username: '',
  },
  setAuth: (user, accessToken, isLogout) => {},
  setAccessToken: accessToken => {},
  refresh: async () => {},
};

const AuthContext = createContext<IAuthContext>(initialAuthState);

export function AuthContextProvider(props: AuthContextProviderProps) {
  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  const isLogoutStr = localStorage.getItem('isLogout');
  let isLogout: boolean = initialAuthState.isLogout;
  if (isLogoutStr) {
    isLogout = JSON.parse(isLogoutStr);
  }
  const [authState, setAuthState] = useState<IAuthContext>({
    ...initialAuthState,
    isLogout,
  });
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.status === 401) {
        setAuth(initialAuthState.user, initialAuthState.accessToken, true);
        navigate('/admin/login');
        return;
      }

      const { user, accessToken }: IAuthContextProps = await response.json();
      console.log('new token', accessToken);
      setAuth(user, accessToken);
    } catch (error) {
      console.log(typeof error);
    }
  }, [navigate]);

  const setAuth = (
    user: IUser,
    accessToken: string,
    isLogout: boolean = false
  ) => {
    localStorage.setItem('isLogout', JSON.stringify(isLogout));
    setAuthState(prevAuthState => ({
      ...prevAuthState,
      user,
      accessToken,
      isLogout,
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
      console.log('trying to get token back');
      refresh();
      return;
    }
    const interval = setInterval(() => {
      refresh();
    }, 60000);

    console.log('start interval', interval);
    return function cleanup() {
      console.log('clear interval', interval);
      clearInterval(interval);
    };
  }, [authState.accessToken, refresh]);

  const context: IAuthContext = {
    ...authState,
    setAuth,
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
