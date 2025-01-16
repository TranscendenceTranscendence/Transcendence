import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 10px;
`;

const DisableTwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('https://localhost:3000/2fa/turn-off', {
        twoFactorAuthenticationCode: code,
      }, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        console.log('Received data:', data);
        if (data.msg === 'TwoFactorAuthentication turned off') {
          setSuccess('2FA has been turned off successfully!');
          navigate('/update');
          setError('');
        } else {
          setError('Invalid 2FA code. Please try again.');
          setSuccess('');
        }
      } else {
        throw new Error('Network response was not ok');
      }
    } catch (error) {
      console.error('Error turning off 2FA:', error);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <Container>
      <h1>Disable Two-Factor Authentication</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="twoFactorAuthenticationCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 2FA code"
          required
        />
        <button type="submit">Disable 2FA</button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
};

export default DisableTwoFactorAuth;