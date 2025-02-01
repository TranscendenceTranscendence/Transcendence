import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../utils/api';
import axios from 'axios';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";


const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

  h1 {
    color: #333;
    font-family: 'Roboto', sans-serif;
    font-size: 1.5rem;
    font-weight: 600;
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
           // Save new access token with 2FA enabled to local storage
          localStorage.setItem('access_token', data.accessToken);
          setError('');
          navigate('/update');
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
      <h1>Google Two Factor Authentication</h1>
      <img src={qr} alt="2FA QR Code" />
      <form onSubmit={handleSubmit}>
        <InputOTP maxLength={6} pattern="[0-9]{6}" >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
      <br />
        <Button className="p-4 rounded-xl w-32" type="submit">Register</Button>
      </form>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
};


export default TwoFactorAuth;