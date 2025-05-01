// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import {
    Container,
    CssBaseline,
    ThemeProvider,
    createTheme,
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CalculateIcon from '@mui/icons-material/Calculate';
import FolderIcon from '@mui/icons-material/Folder';
import CompareIcon from '@mui/icons-material/Compare';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Components
import BusbarForm from './components/BusbarForm';
import BusbarResults from './components/BusbarResults';
import BusbarVisualization from './components/visualization/BusbarVisualization';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectDetail from './components/projects/ProjectDetail';
import BusbarComparison from './components/comparison/BusbarComparison';
import Profile from './components/user/Profile';
import Upgrade from './components/user/Upgrade';
import Resources from './components/resources/Resources';
import NotFound from './components/common/NotFound';

// Services
import { isAuthenticated, logout, initializeAuth } from './services/authService';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" />;
    }
    return children;
};

// Layout component with drawer
const Layout = ({ children }) => {
    const [open, setOpen] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);
    const location = useLocation();

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    // Menu items
    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Calculator', icon: <CalculateIcon />, path: '/calculator' },
        { text: 'Projects', icon: <FolderIcon />, path: '/projects' },
        { text: 'Compare', icon: <CompareIcon />, path: '/compare' },
        { text: 'Resources', icon: <HelpIcon />, path: '/resources' },
    ];

    // Secondary menu items
    const secondaryMenuItems = [
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
        { text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        onClick={handleDrawerOpen}
                        edge="start"
                        sx={{ mr: 2, ...(open && { display: 'none' }) }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Power Busbar Calculator Pro
                    </Typography>
                    <Tooltip title="Account">
                        <IconButton
                            onClick={handleProfileMenuOpen}
                            size="large"
                            color="inherit"
                        >
                            <Avatar sx={{ width: 32, height: 32 }} />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleProfileMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem component="a" href="/profile">
                            <ListItemIcon>
                                <AccountCircleIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem component="a" href="/settings">
                            <ListItemIcon>
                                <SettingsIcon fontSize="small" />
                            </ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: 240,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: 240,
                        boxSizing: 'border-box',
                        ...(open ? { transform: 'translateX(0)' } : { transform: 'translateX(-100%)' }),
                        transition: (theme) => theme.transitions.create('transform', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    },
                }}
                open={open}
            >
                <Toolbar sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    minHeight: (theme) => theme.mixins.toolbar.minHeight
                }}>
                    <IconButton onClick={handleDrawerClose}>
                        <ChevronLeftIcon />
                    </IconButton>
                </Toolbar>
                <Divider />
                <List>
                    {menuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            component="a"
                            href={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                </List>
                <Divider />
                <List>
                    {secondaryMenuItems.map((item) => (
                        <ListItem
                            button
                            key={item.text}
                            component="a"
                            href={item.path}
                            selected={location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItem>
                    ))}
                    <ListItem button onClick={handleLogout}>
                        <ListItemIcon><LogoutIcon /></ListItemIcon>
                        <ListItemText primary="Logout" />
                    </ListItem>
                </List>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                {children}
            </Box>
        </Box>
    );
};

function App() {
    const [results, setResults] = useState(null);
    const [busbarInput, setBusbarInput] = useState(null);

    // Initialize auth state on app load
    useEffect(() => {
        initializeAuth();
    }, []);

    const handleResultsCalculated = (data, input) => {
        setResults(data);
        setBusbarInput(input);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Navigate to="/login" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/calculator"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Container maxWidth="lg">
                                        <Typography variant="h4" component="h1" gutterBottom>
                                            Busbar Design & Analysis Tool
                                        </Typography>
                                        <Typography variant="body1" paragraph>
                                            Calculate sizing, short circuit forces, ampacity, and mechanical properties of power busbars for electrical systems.
                                        </Typography>

                                        <BusbarForm onResultsCalculated={handleResultsCalculated} />

                                        <div id="results-section">
                                            <BusbarResults results={results} />

                                            {results && busbarInput && (
                                                <BusbarVisualization busbarInput={busbarInput} busbarResult={results} />
                                            )}
                                        </div>
                                    </Container>
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ProjectList />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/:id"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ProjectDetail />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/new"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ProjectDetail isNew={true} />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/projects/copy/:id"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <ProjectDetail isCopy={true} />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/compare"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <BusbarComparison />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/upgrade"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Upgrade />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/resources/*"
                        element={
                            <ProtectedRoute>
                                <Layout>
                                    <Resources />
                                </Layout>
                            </ProtectedRoute>
                        }
                    />

                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;