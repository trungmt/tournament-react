interface AppConfigs {
  DEFAULT_URL: string;
  API_URL: string;
  AUTH_URL: string;
  DEFAULT_PAGING_OPTIONS: number[];
}

const constants = (): AppConfigs => {
  const backendURL =
    process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  return {
    DEFAULT_PAGING_OPTIONS: [10, 15, 20],
    DEFAULT_URL: backendURL,
    AUTH_URL: `${backendURL}/auth`,
    API_URL: `${backendURL}/api/admin`,
  };
};

export default constants();
