// src/App.jsx
import React, { useState, createContext } from 'react';
import {
    Container,
    Typography,
    Box,
    CssBaseline,
    AppBar,
    Toolbar,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    useMediaQuery,
    useTheme,
    ThemeProvider,
    createTheme,
    Paper,
    Switch,
    FormControlLabel,
    Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Calculate as CalculateIcon,
    History as HistoryIcon,
    BookmarkBorder as BookmarkIcon,
    Help as HelpIcon,
    GitHub as GitHubIcon
} from '@mui/icons-material';
import BusbarForm from './components/BusbarForm';
import BusbarResults from './components/BusbarResults';

// Create context for sharing state across components
export const AppContext = createContext();

function App() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [results, setResults] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [collaborationMode, setCollaborationMode] = useState(false);
    const [savedDesigns, setSavedDesigns] = useState([]);

    // Create a theme with dark mode support
    const appTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? 'dark' : 'light',
                    primary: {
                        main: '#1976d2',
                    },
                    secondary: {
                        main: '#f50057',
                    },
                },
            }),
        [darkMode],
    );

    const handleResultsCalculated = (data) => {
        setResults(data);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const toggleDrawer = (open) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setDrawerOpen(open);
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const handleSaveDesign = () => {
        if (!results) return;

        // In a real app, this would save to a database or localStorage
        const newDesign = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            description: `Design ${savedDesigns.length + 1}`,
            results: { ...results }
        };

        setSavedDesigns([...savedDesigns, newDesign]);
        alert('Design saved successfully!');
    };

    const drawerList = () => (
        <Box
            sx={{ width: 250 }}
            role="presentation"
            onClick={toggleDrawer(false)}
            onKeyDown={toggleDrawer(false)}
        >
            <List>
                <ListItem>
                    <Typography variant="h6">Busbar Calculator</Typography>
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem button>
                    <ListItemIcon>
                        <CalculateIcon />
                    </ListItemIcon>
                    <ListItemText primary="Calculator" />
                </ListItem>
                <ListItem button>
                    <ListItemIcon>
                        <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText primary="History" />
                </ListItem>
                <ListItem button onClick={handleSaveDesign} disabled={!results}>
                    <ListItemIcon>
                        <BookmarkIcon />
                    </ListItemIcon>
                    <ListItemText primary="Save Current Design" />
                </ListItem>
            </List>
            <Divider />
            <List>
                <ListItem>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={toggleDarkMode}
                            />
                        }
                        label="Dark Mode"
                    />
                </ListItem>
                <ListItem button component="a" href="https://github.com/yourusername/busbarcalculator" target="_blank">
                    <ListItemIcon>
                        <GitHubIcon />
                    </ListItemIcon>
                    <ListItemText primary="GitHub Repository" />
                </ListItem>
            </List>
        </Box>
    );

    return (
        <ThemeProvider theme={appTheme}>
            <AppContext.Provider value={{
                darkMode,
                collaborationMode,
                setCollaborationMode,
                savedDesigns,
                setSavedDesigns
            }}>
                <CssBaseline />
                <AppBar position="static">
                    <Toolbar>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            sx={{ mr: 2 }}
                            onClick={toggleDrawer(true)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Power Busbar Calculator
                        </Typography>
                        <Tooltip title="Toggle Dark Mode">
                            <IconButton color="inherit" onClick={toggleDarkMode}>
                                {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Help">
                            <IconButton color="inherit">
                                <HelpIcon />
                            </IconButton>
                        </Tooltip>
                    </Toolbar>
                </AppBar>

                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer(false)}
                >
                    {drawerList()}
                </Drawer>

                <Container maxWidth="lg">
                    <Box sx={{ my: 4 }}>
                        <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
                            <Typography variant="h4" component="h1" gutterBottom>
                                Busbar Design & Analysis Tool
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Calculate sizing, short circuit forces, ampacity, and mechanical properties of power busbars for electrical systems.
                                This tool provides comprehensive analysis with FEM visualization to help electrical engineers design safe and efficient busbars.
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                <Button variant="contained" color="primary" href="#calculator">
                                    Start Calculating
                                </Button>
                                <Button variant="outlined" color="primary" href="#standard-configs">
                                    View Standard Configurations
                                </Button>
                                {results && (
                                    <Button variant="outlined" color="secondary" onClick={handleSaveDesign}>
                                        Save Current Design
                                    </Button>
                                )}
                            </Box>
                        </Paper>

                        <div id="calculator">
                            <BusbarForm onResultsCalculated={handleResultsCalculated} />
                        </div>

                        <div id="results-section">
                            <BusbarResults results={results} />
                        </div>

                        {/* About this tool section */}
                        <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
                            <Typography variant="h5" gutterBottom>
                                About This Tool
                            </Typography>
                            <Typography variant="body1" paragraph>
                                The Power Busbar Calculator is designed for electrical engineers working on power distribution systems.
                                It provides comprehensive analysis of busbar performance under various conditions, including short circuit events.
                            </Typography>
                            <Typography variant="body1" paragraph>
                                Features include:
                            </Typography>
                            <ul>
                                <li>Temperature rise calculation based on current density</li>
                                <li>Short circuit force calculation</li>
                                <li>Mechanical stress analysis</li>
                                <li>Finite Element Method (FEM) visualization for advanced analysis</li>
                                <li>Recommendations for standard busbar sizes</li>
                                <li>Safety factor analysis</li>
                                <li>PDF report generation</li>
                            </ul>
                            <Typography variant="body2" color="text.secondary">
                                Version 1.0.0 | © 2025 | Open Source under MIT License
                            </Typography>
                        </Paper>
                    </Box>
                </Container>
            </AppContext.Provider>
        </ThemeProvider>
    );
}

export default App;