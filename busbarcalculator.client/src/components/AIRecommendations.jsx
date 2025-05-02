// AIRecommendations.jsx
import React, { useState, useEffect } from 'react';
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, Button } from '@mui/material';
import { RecommendOutlined, WarningAmber, CheckCircleOutline } from '@mui/icons-material';

const AIRecommendations = ({ busbarData }) => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);

    const analyzeDesign = () => {
        setLoading(true);

        // In a real implementation, this would call an AI service
        // For demo, we'll simulate recommendations
        setTimeout(() => {
            const generatedRecommendations = [
                {
                    type: 'warning',
                    message: 'Temperature rise is within 90% of maximum allowable. Consider increasing cross-section area.',
                    impact: 'High',
                    suggestion: 'Increase width by 10mm or thickness by 2mm'
                },
                {
                    type: 'improvement',
                    message: 'Using aluminum instead of copper could reduce cost by approximately 40% with 8% increase in size.',
                    impact: 'Medium',
                    suggestion: 'Switch material to aluminum and increase thickness to 12mm'
                },
                {
                    type: 'positive',
                    message: 'Current mechanical stress is well below maximum limits, design has good safety margin.',
                    impact: 'Low',
                    suggestion: 'No changes needed for mechanical performance'
                }
            ];

            setRecommendations(generatedRecommendations);
            setLoading(false);
        }, 1500);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'warning':
                return <WarningAmber color="warning" />;
            case 'improvement':
                return <RecommendOutlined color="info" />;
            case 'positive':
                return <CheckCircleOutline color="success" />;
            default:
                return <RecommendOutlined />;
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h5" gutterBottom>
                AI Design Recommendations
            </Typography>

            <Typography paragraph>
                Get AI-powered suggestions to optimize your busbar design for cost, efficiency, and safety.
            </Typography>

            <Button
                variant="contained"
                color="primary"
                onClick={analyzeDesign}
                disabled={loading}
                sx={{ mb: 3 }}
            >
                {loading ? 'Analyzing...' : 'Analyze Design'}
            </Button>

            {recommendations.length > 0 && (
                <List>
                    {recommendations.map((rec, index) => (
                        <ListItem key={index} alignItems="flex-start" sx={{ mb: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                            <ListItemIcon>
                                {getIcon(rec.type)}
                            </ListItemIcon>
                            <ListItemText
                                primary={rec.message}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            Impact: {rec.impact}
                                        </Typography>
                                        <br />
                                        <Typography component="span" variant="body2">
                                            Suggestion: {rec.suggestion}
                                        </Typography>
                                    </>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default AIRecommendations;