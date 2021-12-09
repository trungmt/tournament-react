interface AppConfigs {
  SITE_URL: string;
  DEFAULT_BACKEND_URL: string;
  AUTH_API_URL: string;
  ADMIN_API_URL: string;
  DEFAULT_PAGING_OPTIONS: number[];
}

const constants = (): AppConfigs => {
  const siteURL = process.env.REACT_APP_SITE_URL || 'http://localhost:3000';
  const backendURL =
    process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  const backendAPIURL = `${backendURL}/api/v1`;
  return {
    SITE_URL: siteURL,
    DEFAULT_BACKEND_URL: backendURL,
    AUTH_API_URL: `${backendAPIURL}/auth`,
    ADMIN_API_URL: `${backendAPIURL}/admin`,
    DEFAULT_PAGING_OPTIONS: [10, 15, 20],
  };
};

export default constants();
