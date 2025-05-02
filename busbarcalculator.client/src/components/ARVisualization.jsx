// ARVisualization.jsx - A simple example to get started
import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import QRCode from 'react-qr-code';

const ARVisualization = ({ busbarData }) => {
    const [showQRCode, setShowQRCode] = useState(false);

    // Create a unique URL for AR visualization
    const getARUrl = () => {
        // In a real implementation, this would create a unique endpoint
        // with the busbar data encoded or referenced by ID
        const baseUrl = 'https://your-ar-viewer.com/view';
        const params = new URLSearchParams({
            width: busbarData.width || 100,
            height: busbarData.height || 10,
            length: busbarData.length || 1000,
            material: busbarData.material || 'copper',
            temp: busbarData.temperatureRise || 0
        });

        return `${baseUrl}?${params.toString()}`;
    };

    return (
        <Box sx={{ mt: 3, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="h5" gutterBottom>
                AR Visualization
            </Typography>

            <Typography paragraph>
                Experience your busbar design in augmented reality. Scan the QR code with your AR-enabled device.
            </Typography>

            <Button
                variant="contained"
                color="secondary"
                onClick={() => setShowQRCode(!showQRCode)}
            >
                {showQRCode ? 'Hide QR Code' : 'Show QR Code for AR View'}
            </Button>

            {showQRCode && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                    <QRCode value={getARUrl()} size={200} />
                </Box>
            )}
        </Box>
    );
};

export default ARVisualization;