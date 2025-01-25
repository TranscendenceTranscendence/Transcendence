import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "@/hooks/use-toast"
import { Button } from "../../components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../components/ui/form"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/ui/input-otp"

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

const FormSchema = z.object({
  pin: z
    .string()
    .length(6, { message: "Your one-time password must be 6 digits." })
    .regex(/^\d{6}$/, { message: "Your one-time password must contain only digits." }),
});

const TwoFactorAuthForm = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })
  
  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await axios.post('https://localhost:3000/2fa/authenticate', {
        twoFactorAuthenticationCode: data.pin,
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
  }

  return (
    <Container>
      <h1>Google Two-Factor Authentication</h1>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP maxLength={6} {...field}>
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
              </FormControl>
              <FormDescription>
                Please enter the one-time password in your google authenricator app.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />
            <Button type="submit">Submit</Button>
      </form>
    </Form>
  
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
    </Container>
  );
};

export default TwoFactorAuthForm;