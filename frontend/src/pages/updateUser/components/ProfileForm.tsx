import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Grid from '@mui/material/Grid';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/system';
import { Button, Snackbar, Alert, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useApi } from '../../../utils/api';
import type { UpdateUserDto } from '../../../generated-api';
import { Typography } from '@mui/joy';

const FormGrid = styled(Grid)(() => ({
  display: 'flex',
  flexDirection: 'column',
}));

interface ProfileFormProps {
  onSubmit: (data: UpdateUserDto) => void;
}

const ProfileForm = React.forwardRef((props: ProfileFormProps, ref) => {
  const api = useApi();
  const { control, register, handleSubmit, setValue, getValues } = useForm<UpdateUserDto>({
    defaultValues: {
      nickname: '',
      enableTwoFactor: false,
      avatar: '',
    },
  });

  useEffect(() => {
    if (getValues('nickname') !== "") return;
    api.Users.usersControllerMe().then((response) => {
      console.log("response", response);
      setValue('nickname', response.nickname);
      setValue('enableTwoFactor', response.enableTwoFactor);
      setValue('avatar', response.avatar);
    }).catch((error) => {
      console.error(error);
    });
  }, [api.Users, getValues, setValue]);

  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Expose getValues to the parent via ref
  React.useImperativeHandle(ref, () => ({
    getValues,
  }));

  const onSubmit = useCallback(async (data: UpdateUserDto) => {
    setIsSaving(true);
    try {
      await api.Users.usersControllerUpdate({
        updateUserDto: data,
      });
      props.onSubmit(data);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to update profile.', severity: 'error' });
    } finally {
      setIsSaving(false);
    }
  }, [api, props]);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;

    const file = event.target.files[0];
    try {
      const response = await api.FileUpload.fileUploadControllerUploadFile({
        file,
        filename: file.name,
        category: 'avatar',
      });
      setValue('avatar', response.filePath);
      setSnackbar({ open: true, message: 'Avatar uploaded successfully!', severity: 'success' });
    } catch (error) {
      console.error(error);
      setSnackbar({ open: true, message: 'Failed to upload avatar.', severity: 'error' });
    }
  }, [api, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container spacing={3}>
        <FormGrid item xs={12} md={6}>
          <FormLabel htmlFor="nickname" required>
            Nickname
          </FormLabel>
          <OutlinedInput
            id="nickname"
            {...register('nickname', { required: 'Nickname is required' })}
            placeholder="John"
            autoComplete="off"
            size="small"
          />
        </FormGrid>
        <FormGrid item xs={12} md={12}>
          <input
            accept="image/*"
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Grid container spacing={1}
              sx={{
                alignItems: "center",
                padding: ".5em",
              }}
            >
              <Button variant="contained" component="span">
                {getValues('avatar') ? 'Change avatar' : 'Upload avatar'}
              </Button>
              <Typography
                sx={{
                  width: 300, // Limit the width
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  direction: 'rtl', // Shows the end of the text
                  paddingLeft: "1em",
                }}
              >
                {getValues('avatar')}
              </Typography>
            </Grid>
          </label>
        </FormGrid>
        <FormGrid item xs={12}>
          <Controller
            name="enableTwoFactor"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Enable Two-Factor Authentication"
              />
            )}
          />
        </FormGrid>
        <FormGrid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={isSaving}
            startIcon={isSaving && <CircularProgress size={20} color="inherit" />}
          >
            {isSaving ? 'Saving...' : 'Submit'}
          </Button>
        </FormGrid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </form>
  );
});

export default ProfileForm;