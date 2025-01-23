import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { authenticator } from 'otplib';

const GoogleAuthenticator: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri('user@example.com', 'Transcendence', secret);

    QRCode.toDataURL(otpauth, (err, url) => {
      if (err) {
        console.error('Error generating QR code', err);
        return;
      }
      setQrCodeUrl(url);
    });
  }, []);

  return (
    <div>
      <h1>Register Google Authenticator</h1>
      <p>Scan the QR code below with your Google Authenticator app:</p>
      {qrCodeUrl ? <img src={qrCodeUrl} alt="Google Authenticator QR Code" /> : 'Loading QR code...'}
    </div>
  );
};

export default GoogleAuthenticator;