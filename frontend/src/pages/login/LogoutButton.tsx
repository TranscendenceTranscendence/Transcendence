import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useApi } from '@/utils/api';

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {

    try {
        await axios.post('https://localhost:3000/auth/logout', {}, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
        // Clear local storage
        localStorage.removeItem('access_token');
        // localStorage.removeItem('refreshToken'); // If you have a refresh token
        // Add any other items you need to clear from local storage
    
        // Redirect to login page
        navigate('/login');
    } catch (error) {
        console.error('Error logging out:', error);
    }
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;