// busbarcalculator.client/src/components/user/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
    Typography,
    Paper,
    Box,
    TextField,
    Button,
    Grid,
    Divider,
    CircularProgress,
    Alert
} from '@mui/material';
import { getCurrentUser } from '../../services/authService';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phoneNumber: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userData = getCurrentUser();
                setUser(userData?.user);

                if (userData?.user) {
                    setFormData({
                        name: userData.user.name || '',
                        email: userData.user.email || '',
                        company: userData.user.company || '',
                        phoneNumber: userData.user.phoneNumber || ''
                    });
                }
            } catch (error) {
                console.error('Failed to load user data:', error);
                setError('Failed to load user profile data');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // API call to update profile would go here
            // For now, we'll just simulate a successful update
            setTimeout(() => {
                setSuccess('Profile updated successfully');
                setIsEditing(false);
                setLoading(false);
            }, 1000);
        } catch (error) {
            console.error('Failed to update profile:', error);
            setError('Failed to update profile. Please try again.');
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
                User Profile
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="name"
                            label="Full Name"
                            value={formData.name}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="email"
                            label="Email"
                            value={formData.email}
                            onChange={handleChange}
                            fullWidth
                            disabled
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="company"
                            label="Company"
                            value={formData.company}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            name="phoneNumber"
                            label="Phone Number"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            fullWidth
                            disabled={!isEditing}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    {!isEditing ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit Profile
                        </Button>
                    ) : (
                        <>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        </>
                    )}
                </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" gutterBottom>
                License Information
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle1">License Type</Typography>
                    <Typography variant="body1" color="primary" fontWeight="bold">
                        {user?.licenseType || 'Trial'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle1">Expiry Date</Typography>
                    <Typography variant="body1">
                        {user?.licenseExpiry || 'N/A'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle1">License Key</Typography>
                    <Typography variant="body1">
                        {user?.licenseKey || 'N/A'}
                    </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle1">Status</Typography>
                    <Typography variant="body1" color={user?.licenseActive ? 'success.main' : 'error.main'} fontWeight="bold">
                        {user?.licenseActive ? 'Active' : 'Inactive'}
                    </Typography>
                </Grid>
            </Grid>

            <Button
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
                href="/upgrade"
            >
                Upgrade License
            </Button>
        </Paper>
    );
};

export default Profile;