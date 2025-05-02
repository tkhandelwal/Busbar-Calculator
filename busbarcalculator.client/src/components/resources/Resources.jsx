// busbarcalculator.client/src/components/resources/Resources.jsx
import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import {
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Divider,
    Box,
    List,
    ListItem,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import ArticleIcon from '@mui/icons-material/Article';

// Resource content components
const ResourcesHome = () => {
    const resources = [
        {
            title: 'Busbar Sizing Guide',
            description: 'Learn best practices for sizing busbars for different applications',
            icon: <ArticleIcon fontSize="large" color="primary" />,
            link: '/resources/sizing-guide'
        },
        {
            title: 'Short Circuit Analysis',
            description: 'Understanding short circuit calculations and their importance',
            icon: <ArticleIcon fontSize="large" color="primary" />,
            link: '/resources/short-circuit'
        },
        {
            title: 'Video Tutorials',
            description: 'Step-by-step guides to using all features of the application',
            icon: <PlayCircleOutlineIcon fontSize="large" color="primary" />,
            link: '/resources/tutorials'
        },
        {
            title: 'Frequently Asked Questions',
            description: 'Answers to common questions about busbar calculations',
            icon: <ArticleIcon fontSize="large" color="primary" />,
            link: '/resources/faq'
        },
        {
            title: 'Standards Reference',
            description: 'Overview of relevant standards for busbar design',
            icon: <PictureAsPdfIcon fontSize="large" color="primary" />,
            link: '/resources/standards'
        },
        {
            title: 'Material Properties',
            description: 'Detailed information about busbar materials',
            icon: <ArticleIcon fontSize="large" color="primary" />,
            link: '/resources/materials'
        }
    ];

    return (
        <>
            <Typography variant="h5" component="h1" gutterBottom>
                Resources & Documentation
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Typography variant="body1" paragraph>
                Browse our collection of guides, tutorials, and reference materials to help you get the most out of the Busbar Calculator tool.
            </Typography>

            <Grid container spacing={3} sx={{ mt: 2 }}>
                {resources.map((resource) => (
                    <Grid item xs={12} sm={6} md={4} key={resource.title}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    {resource.icon}
                                </Box>
                                <Typography variant="h6" component="h2" gutterBottom align="center">
                                    {resource.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {resource.description}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    component={Link}
                                    to={resource.link}
                                    size="small"
                                    fullWidth
                                >
                                    View Resource
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

const FAQ = () => {
    const faqs = [
        {
            question: 'What is the difference between LV, MV, and HV busbars?',
            answer: 'Low Voltage (LV) busbars operate at voltages up to 1kV, Medium Voltage (MV) busbars operate between 1kV and 36kV, and High Voltage (HV) busbars operate above 36kV. Each voltage level has different design requirements for insulation, spacing, and cooling.'
        },
        {
            question: 'How is short circuit current calculated?',
            answer: 'Short circuit current is typically calculated using power system analysis software that models the entire electrical network. It considers source impedances, transformer impedances, cable impedances, and other factors to determine the maximum fault current at various points in the system.'
        },
        {
            question: 'What is the recommended current density for copper busbars?',
            answer: 'The typical recommended current density for copper busbars is between 1.2 and 2.0 A/mm². For continuous operation, lower values around 1.5 A/mm² are commonly used to reduce temperature rise.'
        },
        {
            question: 'Why is temperature rise important for busbar design?',
            answer: 'Temperature rise affects the performance and lifespan of busbars. Excessive temperature can lead to degradation of insulation materials, increased contact resistance, reduced mechanical strength, and accelerated aging of materials. It also increases the risk of thermal runaway conditions.'
        },
        {
            question: 'What factors affect the mechanical stress in busbars during short circuits?',
            answer: 'Mechanical stress during short circuits is affected by the magnitude of short circuit current, the duration of the fault, the spacing between phases, the support structure and span length, and the mechanical properties of the busbar material.'
        }
    ];

    return (
        <>
            <Typography variant="h5" component="h1" gutterBottom>
                Frequently Asked Questions
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ mt: 2 }}>
                {faqs.map((faq, index) => (
                    <Accordion key={index}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls={`faq-content-${index}`}
                            id={`faq-header-${index}`}
                        >
                            <Typography variant="subtitle1">{faq.question}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body1">{faq.answer}</Typography>
                        </AccordionDetails>
                    </Accordion>
                ))}
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button component={Link} to="/resources" variant="outlined">
                    Back to Resources
                </Button>
            </Box>
        </>
    );
};

// Main Resources component with routing
const Resources = () => {
    return (
        <Paper elevation={3} sx={{ p: 3 }}>
            <Routes>
                <Route path="/" element={<ResourcesHome />} />
                <Route path="/faq" element={<FAQ />} />
                {/* Add routes for other resource pages */}
                <Route path="*" element={<ResourcesHome />} />
            </Routes>
        </Paper>
    );
};

export default Resources;