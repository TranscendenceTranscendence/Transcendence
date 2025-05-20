export const useConfig = () => {
  const config = {
    frontendUrl:
      process.env.REACT_APP_FRONTEND_URL ||
      (console.error("REACT_APP_FRONTEND_URL not set"), "https://f1r3s12:3001"),
    backendUrl:
      process.env.REACT_APP_BACKEND_URL ||
      (console.error("REACT_APP_BACKEND_URL not set"), "https://f1r3s12:3000"),
    developmentMode: process.env.NODE_ENV === "development",
  };
  return config;
};
