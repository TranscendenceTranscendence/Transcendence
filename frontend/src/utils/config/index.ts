
export const useConfig = () => {
  const config = {
    frontendUrl: process.env.REACT_APP_FRONTEND_URL || (console.error("REACT_APP_FRONTEND_URL not set"), "http://localhost:3001"),
    backendUrl: process.env.REACT_APP_BACKEND_URL || (console.error("REACT_APP_BACKEND_URL not set"), "http://localhost:3000"),
  };
  return config;
}
