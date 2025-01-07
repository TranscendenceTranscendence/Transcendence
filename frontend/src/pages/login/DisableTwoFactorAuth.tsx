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

    var fd = new FormData();
    fd.append("twoFactorAuthenticationCode", code);

    fetch(`https://localhost:3000/2fa/turn-off`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify({twoFactorAuthenticationCode: code}),
    }).then(response => {
      if (response.status === 200 || response.status === 201) {
        return response.json(); 
      } else {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
      console.log('Received data:', data);
      if (data.msg === 'TwoFactorAuthentication turned off') {
        setSuccess('2FA successfully turned off!');
        navigate('/update');
        setError('');
      } else {
        setError('Invalid 2FA code. Please try again.');
        setSuccess('');
      }
    }).catch(error => {
      setError('An error occurred. Please try again.');
      setSuccess('');
    });
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