// src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Typography,
    Grid,
    Paper,
    Button,
    Box,
    Card,
    CardContent,
    CardActions,
    Divider,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import CalculateIcon from '@mui/icons-material/Calculate';
import BarChartIcon from '@mui/icons-material/BarChart';
import moment from 'moment';

import { getProjects } from '../../services/projectService';
import { getCurrentUser } from '../../services/authService';

const Dashboard = () => {
    const [recentProjects, setRecentProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Load user data
                const currentUser = getCurrentUser();
                setUser(currentUser?.user);

                // Load recent projects
                const projects = await getProjects();
                setRecentProjects(projects.slice(0, 5)); // Get only 5 most recent
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Welcome back, {user?.name || 'User'}!
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {/* Quick Actions */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Quick Actions
                        </Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Button
                                    component={Link}
                                    to="/calculator"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<CalculateIcon />}
                                >
                                    New Calculation
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    component={Link}
                                    to="/projects/new"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<AddIcon />}
                                >
                                    New Project
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    component={Link}
                                    to="/projects"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<FolderOpenIcon />}
                                >
                                    View All Projects
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    component={Link}
                                    to="/compare"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<BarChartIcon />}
                                >
                                    Compare Configurations
                                </Button>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Recent Projects */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Recent Projects
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        {recentProjects.length > 0 ? (
                            <List>
                                {recentProjects.map(project => (
                                    <ListItem
                                        key={project.id}
                                        component={Link}
                                        to={`/projects/${project.id}`}
                                        sx={{
                                            textDecoration: 'none',
                                            color: 'inherit',
                                            border: '1px solid #eee',
                                            borderRadius: 1,
                                            mb: 1,
                                            '&:hover': {
                                                backgroundColor: '#f5f5f5'
                                            }
                                        }}
                                    >
                                        <ListItemText
                                            primary={project.name}
                                            secondary={`Last modified: ${moment(project.lastModifiedDate).format('MMM D, YYYY')}`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        ) : (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <Typography variant="body1" color="textSecondary">
                                    You don't have any projects yet.
                                </Typography>
                                <Button
                                    component={Link}
                                    to="/projects/new"
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    startIcon={<AddIcon />}
                                >
                                    Create Your First Project
                                </Button>
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* License Status */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            License Status
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Typography variant="body1" gutterBottom>
                            Plan: <Chip label={user?.licenseType || "Trial"} color="primary" size="small" />
                        </Typography>

                        <Typography variant="body2" gutterBottom>
                            Expires: {user?.licenseExpiry ? moment(user.licenseExpiry).format('MMM D, YYYY') : "30 days from registration"}
                        </Typography>

                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            component={Link}
                            to="/upgrade"
                        >
                            Upgrade Plan
                        </Button>
                    </Paper>
                </Grid>

                {/* Tips & Resources */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Tips & Resources
                        </Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Busbar Sizing Guide
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Learn best practices for sizing busbars for different applications
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to="/resources/sizing-guide">
                                            Read More
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Short Circuit Analysis
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Understanding short circuit calculations and their importance
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to="/resources/short-circuit">
                                            Read More
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Video Tutorials
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Step-by-step guides to using all features of the application
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to="/resources/tutorials">
                                            Watch Now
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            FAQ
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Answers to frequently asked questions about busbar calculations
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" component={Link} to="/resources/faq">
                                            View FAQ
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard;