// src/components/auth/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    Alert,
    CircularProgress
} from '@mui/material';
import { register } from '../../services/authService';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        company: '',
        phoneNumber: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registrationData } = formData;
            await register(registrationData);
            navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
        } catch (err) {
            setError(err.response?.data || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Grid container justifyContent="center" sx={{ mt: 8 }}>
            <Grid item xs={12} sm={8} md={6} lg={5}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom align="center">
                        Power Busbar Calculator
                    </Typography>
                    <Typography variant="h6" gutterBottom align="center">
                        Create an Account
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Box component="form" onSubmit={handleRegister}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    name="name"
                                    label="Full Name"
                                    fullWidth
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="email"
                                    label="Email"
                                    type="email"
                                    fullWidth
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="password"
                                    label="Password"
                                    type="password"
                                    fullWidth
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    name="confirmPassword"
                                    label="Confirm Password"
                                    type="password"
                                    fullWidth
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="company"
                                    label="Company (Optional)"
                                    fullWidth
                                    value={formData.company}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    name="phoneNumber"
                                    label="Phone Number (Optional)"
                                    fullWidth
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </Grid>
                        </Grid>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3, mb: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>

                        <Grid container justifyContent="center">
                            <Grid item>
                                <Link to="/login" style={{ textDecoration: 'none' }}>
                                    Already have an account? Sign in
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default Register;