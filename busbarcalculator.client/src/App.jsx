// src/App.jsx
import React, { useState } from 'react';
import { Container, Typography, Box, CssBaseline, AppBar, Toolbar } from '@mui/material';
import BusbarForm from './components/BusbarForm';
import BusbarResults from './components/BusbarResults';

function App() {
    const [results, setResults] = useState(null);

    const handleResultsCalculated = (data) => {
        setResults(data);

        // Scroll to results
        setTimeout(() => {
            document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    return (
        <>
            <CssBaseline />
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Power Busbar Calculator
                    </Typography>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg">
                <Box sx={{ my: 4 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Busbar Design & Analysis Tool
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Calculate sizing, short circuit forces, ampacity, and mechanical properties of power busbars for electrical systems.
                    </Typography>

                    <BusbarForm onResultsCalculated={handleResultsCalculated} />

                    <div id="results-section">
                        <BusbarResults results={results} />
                    </div>
                </Box>
            </Container>
        </>
    );
}

export default App;