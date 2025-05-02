// busbarcalculator.client/src/components/user/Upgrade.jsx
import React, { useState } from 'react';
import {
    Typography,
    Paper,
    Box,
    Grid,
    Card,
    CardContent,
    CardHeader,
    CardActions,
    Button,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Alert,
    CircularProgress
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const Upgrade = () => {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [licenseKey, setLicenseKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const plans = [
        {
            name: 'Basic',
            price: '$19.99/month',
            features: [
                'Standard Busbar Calculations',
                'Pre-defined Configurations',
                'Save up to 5 Projects',
                'PDF Reports',
                'Basic Support'
            ],
            limitations: [
                'No Advanced Calculations',
                'No 3D Visualization',
                'No FEM Analysis'
            ]
        },
        {
            name: 'Professional',
            price: '$49.99/month',
            features: [
                'All Basic Features',
                'Advanced Calculations',
                '3D Visualization',
                'Unlimited Projects',
                'Priority Support',
                'Project Comparison'
            ],
            limitations: [
                'No FEM Analysis',
                'No API Access'
            ]
        },
        {
            name: 'Enterprise',
            price: 'Contact for Pricing',
            features: [
                'All Professional Features',
                'FEM Analysis',
                'API Access',
                'Multi-user Access',
                'Custom Configurations',
                'Dedicated Support',
                'On-premises Option'
            ],
            limitations: []
        }
    ];

    const handlePlanSelect = (plan) => {
        setSelectedPlan(plan);
        setDialogOpen(true);
    };

    const handleActivate = async () => {
        if (!licenseKey.trim()) {
            setError('Please enter a valid license key');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // API call to activate license would go here
            // For now, we'll just simulate a successful activation
            setTimeout(() => {
                setSuccess(`Successfully upgraded to ${selectedPlan.name} plan`);
                setDialogOpen(false);
                setLicenseKey('');
                setLoading(false);
            }, 1500);
        } catch (error) {
            console.error('Failed to activate license:', error);
            setError('Failed to activate license. Please check your key and try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" component="h1" gutterBottom>
                    Upgrade Your Plan
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Typography variant="body1" paragraph>
                    Choose the plan that best fits your needs. Upgrade to unlock advanced features and capabilities.
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    {plans.map((plan) => (
                        <Grid item xs={12} md={4} key={plan.name}>
                            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <CardHeader
                                    title={plan.name}
                                    titleTypographyProps={{ align: 'center', variant: 'h5' }}
                                    sx={{
                                        backgroundColor: plan.name === 'Professional' ? 'primary.main' : 'grey.200',
                                        color: plan.name === 'Professional' ? 'white' : 'text.primary'
                                    }}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Box sx={{ textAlign: 'center', mb: 2 }}>
                                        <Typography variant="h6" color="text.primary">
                                            {plan.price}
                                        </Typography>
                                    </Box>
                                    <Divider sx={{ mb: 2 }} />
                                    <List dense>
                                        {plan.features.map((feature) => (
                                            <ListItem key={feature}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CheckIcon color="success" />
                                                </ListItemIcon>
                                                <ListItemText primary={feature} />
                                            </ListItem>
                                        ))}
                                        {plan.limitations.map((limitation) => (
                                            <ListItem key={limitation}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <CloseIcon color="error" />
                                                </ListItemIcon>
                                                <ListItemText primary={limitation} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </CardContent>
                                <CardActions>
                                    <Button
                                        fullWidth
                                        variant={plan.name === 'Professional' ? 'contained' : 'outlined'}
                                        color="primary"
                                        onClick={() => handlePlanSelect(plan)}
                                    >
                                        {plan.name === 'Enterprise' ? 'Contact Sales' : 'Upgrade Now'}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            {/* License Key Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Activate {selectedPlan?.name} License</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" paragraph>
                        Enter your license key to activate {selectedPlan?.name} plan.
                        If you don't have a license key, please purchase one from our website.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="License Key"
                        fullWidth
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                        required
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleActivate}
                        variant="contained"
                        color="primary"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Activate'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Upgrade;