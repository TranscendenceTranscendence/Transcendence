import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  exp: number;
  userId: string;
  isSecondFactorAuthenticated: boolean;
  needsTwoFactorAuthentication: boolean;
}

// Function to check authentication and get user details
const getAuthData = (): DecodedToken & { isAuthenticated: boolean } => {
  const token = localStorage.getItem("access_token");
  if (!token)
    return {
      isAuthenticated: false,
      exp: 0,
      userId: "",
      isSecondFactorAuthenticated: false,
      needsTwoFactorAuthentication: false,
    };

  try {
    const decoded: DecodedToken = jwtDecode(token);
    const isTokenValid = decoded.exp * 1000 > Date.now();
    console.log(decoded);
    return {
      isAuthenticated: isTokenValid,
      ...(isTokenValid && decoded),
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      exp: 0,
      userId: "",
      isSecondFactorAuthenticated: false,
      needsTwoFactorAuthentication: false,
    };
  }
};

export default getAuthData;
