import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Stack,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";
import { useApi } from '../utils/api';

const UpdateProfile = () => {
  const api = useApi();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  const handleNicknameChange = (event) => {
    setNickname(event.target.value);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file: File = event.target.files[0];
    console.log(file);
    const formData = new FormData();
    formData.append('file', file);
    api.FileUpload.fileUploadUploadFileRaw(
      {
        file: file,
        filename: file.name,
        category: 'avatar',
      },
    ).then((response) => {
      console.log(response);
    }).catch((error) => {
      console.error(error);
    });
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleTwoFactorChange = (event) => {
    setTwoFactorAuth(event.target.checked);
  };

  const handleSave = () => {
    // Add logic to save nickname, avatar, and 2FA status
    console.log("Nickname:", nickname);
    console.log("Avatar:", avatar);
    console.log("Two Factor Auth Enabled:", twoFactorAuth);
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        margin: "0 auto",
        padding: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        Update Profile
      </Typography>

      <Stack alignItems="center" spacing={2}>
        <Avatar
          src={avatar}
          alt="Avatar Preview"
          sx={{ width: 80, height: 80 }}
        />
        <IconButton
          color="primary"
          aria-label="upload picture"
          component="label"
        >
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={handleAvatarChange}
          />
          <PhotoCamera />
        </IconButton>
      </Stack>

      <TextField
        label="Nickname"
        variant="outlined"
        fullWidth
        value={nickname}
        onChange={handleNicknameChange}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={twoFactorAuth}
            onChange={handleTwoFactorChange}
            color="primary"
          />
        }
        label="Enable Two-Factor Authentication"
      />

      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleSave}
      >
        Save Changes
      </Button>
    </Box>
  );
};

export default UpdateProfile;
