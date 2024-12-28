import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid2';
import AppTheme from '../../shared-theme/AppTheme.tsx';
import { Button } from '@mui/material';
import { Typography } from '@mui/joy';

export default function Login(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Grid
        container
        sx={{
          height: {
            xs: '100%',
            sm: 'calc(100dvh - var(--template-frame-height, 0px))',
          },
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '4rem',
            fontWeight: 'bold',
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0)',
            backgroundSize: '200% auto',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            animation: 'gradient-animation 3s linear infinite alternate',
            '@keyframes gradient-animation': {
              '0%': { backgroundPosition: '0% 50%' },
              '100%': { backgroundPosition: '100% 50%' },
            },
          }}
        >
          Transcendence
        </Typography>
        <Button
          component="a"
          variant="contained"
          color="primary"
          sx={{
            transition: '0.3s',
            '&:hover': {
              transform: 'scale(1.1)',
            },
            marginBottom: '4rem',
          }}
          href="https://localhost:3000/auth/42/login"
          size="large"
        >
          Login with 42.intra
        </Button>
      </Grid>
    </AppTheme>
  );
}
