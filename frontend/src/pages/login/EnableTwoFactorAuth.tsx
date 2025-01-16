import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../utils/api';
import axios from 'axios';

const TwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [qr, setQr] = useState('');
  const navigate = useNavigate();
  const api = useApi();

  const generateBase64FromStream = async (readableStream) => {
    const response = new Response(readableStream);
    const buffer = await response.arrayBuffer(); // Convert the stream to ArrayBuffer
    return arrayBufferToBase64(buffer);
  };
  
  const arrayBufferToBase64 = (buffer) => {
    const binary = String.fromCharCode(...new Uint8Array(buffer));
    return btoa(binary); // Convert to Base64
  };
  
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const response = await axios.get('https://localhost:3000/2fa/generate', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          responseType: 'blob',
        });
        console.log('2FA QR code generated:', response);

        const reader = new FileReader();
        reader.onload = () => {
          setQr(reader.result as string);
        };
        reader.readAsDataURL(response.data);

      } catch (error) {
        console.error('Failed to generate 2FA QR code:', error);
        setError('Failed to generate 2FA QR code');
      }
    };
  
    generateQRCode();
  }, []);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await axios.post('https://localhost:3000/2fa/turn-on', {
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
        if (data.msg === 'TwoFactorAuthentication turned on') {
          setSuccess('2FA verification successful!');
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
      console.error('Error verifying 2FA code:', error);
      setError('An error occurred. Please try again.');
      setSuccess('');
    }
  };

  return (
    <Container>
      <h1>Google 2-Factor Authentication</h1>
      <form onSubmit={handleSubmit}>
        <img src={qr} alt="2FA QR Code" />
        <input
          type="text"
          name="twoFactorAuthenticationCode"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter 2FA code"
          required
        />
        <button type="submit">Verify</button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f2f2f2;
  height: 100vh;
  padding: 2rem;
  box-sizing: border-box;

  h1 {
    color: #333;
    font-family: 'Roboto', sans-serif;
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;

    input {
      padding: 0.5rem;
      font-size: 1rem;
      margin-bottom: 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }

    button {
      padding: 0.5rem 1rem;
      font-size: 1rem;
      color: white;
      background-color: #5865f2;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #4752c4;
      }
    }
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 1rem;
`;

export default TwoFactorAuth;