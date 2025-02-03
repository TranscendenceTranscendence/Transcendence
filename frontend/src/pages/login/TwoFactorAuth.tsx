import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { Button } from "../../components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/ui/input-otp"
import { Code } from 'lucide-react';

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
    justify-content: center;
  }

`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 10px;
`;

const SuccessMessage = styled.div`
  color: green;
  margin-top: 10px;
`;


const TwoFactorAuth = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const api = useApi();
  
  const onSubmit = async (e: React.FormEvent) => {
    console.log(e);
    e.preventDefault();

      try {
        const response = await axios.post('https://localhost:3000/2fa/authenticate', {
          twoFactorAuthenticationCode: code,
        }, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        });

        console.log('Response:', response);
        if (response.status === 200 || response.status === 201) {
          const data = response.data;
          if (data.msg === 'Authenticated successfully') {
            // Save new access token with 2FA enabled to local storage
            localStorage.setItem('access_token', data.accessToken);
            setSuccess('2FA authentication successful!');

            navigate('/'); // Redirect to home page
            setError('');
          } else {
            setError('Invalid 2FA code. Please try again.');
            setSuccess('');
          }
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (error) {
        console.error('Error authenticating 2FA code:', error);
        setError('An error occurred. Please try again.');
        setSuccess('');
      }
      
    };
  return (
      <Container>
        <h1>Google Two-Factor Authentication</h1>
        <form onSubmit={onSubmit} >
            <InputOTP onChange={setCode} maxLength={6}>
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
            <p className="text-sm">Please enter the one-time password in your google authenricator app.</p>
          <br />
              <Button className="p-4 rounded-xl w-32" type="submit">Submit</Button>
        </form>
    
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Container>
    );
};

export default TwoFactorAuth;