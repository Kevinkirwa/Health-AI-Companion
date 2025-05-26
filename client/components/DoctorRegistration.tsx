import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, TextField, Select, MenuItem, FormControl, InputLabel, Box, Typography, Alert } from '@mui/material';
import { useAuth } from '../hooks/useAuth';

const doctorRegistrationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  specialization: z.string().min(1, 'Specialization is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  hospitalId: z.string().min(1, 'Hospital is required'),
  department: z.string().min(1, 'Department is required'),
  appointmentDuration: z.number().min(15, 'Minimum duration is 15 minutes'),
  maxAppointmentsPerDay: z.number().min(1, 'Must have at least 1 appointment per day')
});

type DoctorRegistrationForm = z.infer<typeof doctorRegistrationSchema>;

export const DoctorRegistration: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const { register, handleSubmit, formState: { errors } } = useForm<DoctorRegistrationForm>({
    resolver: zodResolver(doctorRegistrationSchema)
  });

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setDocuments(Array.from(event.target.files));
    }
  };

  const onSubmit = async (data: DoctorRegistrationForm) => {
    try {
      setError('');
      setSuccess('');

      // Generate username from email
      const username = data.email.split('@')[0];

      // Create registration data
      const registrationData = {
        ...data,
        username,
        name: `${data.firstName} ${data.lastName}`,
        password: Math.random().toString(36).slice(-8), // Generate a random password
      };

      const response = await fetch('/api/doctors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const responseData = await response.json();
      setSuccess('Registration successful! Please check your email for login credentials.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Doctor Registration
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <TextField
        fullWidth
        label="First Name"
        {...register('firstName')}
        error={!!errors.firstName}
        helperText={errors.firstName?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Last Name"
        {...register('lastName')}
        error={!!errors.lastName}
        helperText={errors.lastName?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Phone"
        {...register('phone')}
        error={!!errors.phone}
        helperText={errors.phone?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Specialization"
        {...register('specialization')}
        error={!!errors.specialization}
        helperText={errors.specialization?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="License Number"
        {...register('licenseNumber')}
        error={!!errors.licenseNumber}
        helperText={errors.licenseNumber?.message}
        margin="normal"
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Hospital</InputLabel>
        <Select
          {...register('hospitalId')}
          error={!!errors.hospitalId}
        >
          {/* Add hospital options */}
        </Select>
      </FormControl>

      <FormControl fullWidth margin="normal">
        <InputLabel>Department</InputLabel>
        <Select
          {...register('department')}
          error={!!errors.department}
        >
          {/* Add department options */}
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Appointment Duration (minutes)"
        type="number"
        {...register('appointmentDuration', { valueAsNumber: true })}
        error={!!errors.appointmentDuration}
        helperText={errors.appointmentDuration?.message}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Max Appointments Per Day"
        type="number"
        {...register('maxAppointmentsPerDay', { valueAsNumber: true })}
        error={!!errors.maxAppointmentsPerDay}
        helperText={errors.maxAppointmentsPerDay?.message}
        margin="normal"
      />

      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Required Documents
        </Typography>
        <input
          type="file"
          multiple
          onChange={handleDocumentChange}
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <Typography variant="caption" color="textSecondary">
          Upload your medical license, ID, and specialization certificates
        </Typography>
      </Box>

      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 3 }}
      >
        Register
      </Button>
    </Box>
  );
}; 