import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    exp: number;  // Expiration time in seconds
    userId: string;  // Add other fields as needed
}

// Function to check authentication and get user details
const getAuthData = (): { isAuthenticated: boolean; userId?: string } => {
    const token = localStorage.getItem("access_token");
    if (!token) return { isAuthenticated: false };

    try {
        const decoded: DecodedToken = jwtDecode(token);
        const isTokenValid = decoded.exp * 1000 > Date.now();
        return {
            isAuthenticated: isTokenValid,
            userId: isTokenValid ? decoded.userId : undefined,
        };
    } catch (error) {
        return { isAuthenticated: false };
    }
};

export default getAuthData;