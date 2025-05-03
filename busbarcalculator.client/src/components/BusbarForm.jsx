// src/components/BusbarForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Checkbox,
    FormControlLabel,
    Paper,
    Divider,
    CircularProgress,
    Card,
    CardContent,
    CardActions
} from '@mui/material';
import {
    calculateBusbar,
    getMaterials,
    getVoltageLevels,
    getStandardConfigs
} from '../services/api';

const BusbarForm = ({ onResultsCalculated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [materials, setMaterials] = useState(['Copper', 'Aluminum']);
    const [voltageLevels, setVoltageLevels] = useState(['LV', 'MV', 'HV']);
    const [standardConfigs, setStandardConfigs] = useState([]);
    const [selectedVoltageLevel, setSelectedVoltageLevel] = useState('');
    const [advancedMode, setAdvancedMode] = useState(false);

    const { control, handleSubmit, setValue, formState: { errors }, watch, reset } = useForm({
        defaultValues: {
            current: '',
            voltage: '',
            material: 'Copper',
            ambientTemperature: 40,
            arrangement: 'Horizontal',
            phaseDistance: '',
            shortCircuitCurrent: '',
            busbarLength: 1000,
            busbarWidth: '',
            busbarThickness: '',
            numberOfBarsPerPhase: 1,
            useAdvancedCalculation: false,
            voltageLevel: 'LV'
        }
    });

    const material = watch('material');
    const voltageLevel = watch('voltageLevel');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [materialsData, voltageLevelsData] = await Promise.all([
                    getMaterials(),
                    getVoltageLevels()
                ]);

                setMaterials(materialsData);
                setVoltageLevels(voltageLevelsData);
            } catch (error) {
                console.error('Failed to fetch initial data', error);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchConfigsByVoltageLevel = async () => {
            if (selectedVoltageLevel) {
                try {
                    const configs = await getStandardConfigs(selectedVoltageLevel);
                    setStandardConfigs(configs);
                } catch (error) {
                    console.error('Failed to fetch standard configurations', error);
                }
            }
        };

        fetchConfigsByVoltageLevel();
    }, [selectedVoltageLevel]);

    const handleVoltageLevelChange = (event) => {
        setSelectedVoltageLevel(event.target.value);
    };

    const handleConfigSelect = (config) => {
        // Populate form with selected configuration
        setValue('current', config.current);
        setValue('voltage', config.voltage);
        setValue('material', config.material);
        setValue('voltageLevel', config.voltageLevel);
        setValue('busbarWidth', config.width);
        setValue('busbarThickness', config.thickness);
        setValue('shortCircuitCurrent', config.shortCircuitCurrent);
        setValue('phaseDistance', config.phaseDistance);
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            console.log('Form submitted with data:', data);
            const results = await calculateBusbar(data);
            console.log('Received results:', results);

            if (typeof onResultsCalculated === 'function') {
                onResultsCalculated(results);
            } else {
                console.error('onResultsCalculated is not a function', onResultsCalculated);
            }
        } catch (error) {
            console.error('Error calculating busbar:', error);
            // Add error handling here - show an error message to the user
        } finally {
            setIsLoading(false);
        }
    };



    return (
        <>
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Standard Configurations
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Voltage Level</InputLabel>
                        <Select
                            value={selectedVoltageLevel}
                            onChange={handleVoltageLevelChange}
                            label="Voltage Level"
                        >
                            <MenuItem value="">
                                <em>All</em>
                            </MenuItem>
                            {voltageLevels.map((level) => (
                                <MenuItem key={level} value={level}>
                                    {level} ({level === 'LV' ? '≤1kV' : level === 'MV' ? '1-36kV' : '>36kV'})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                <Grid container spacing={2}>
                    {standardConfigs.map((config) => (
                        <Grid item xs={12} sm={6} md={4} key={config.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6" component="div">
                                        {config.name}
                                    </Typography>
                                    <Typography color="text.secondary" gutterBottom>
                                        {config.voltageLevel} - {config.voltage}kV
                                    </Typography>
                                    <Typography variant="body2">
                                        Current: {config.current}A
                                    </Typography>
                                    <Typography variant="body2">
                                        Material: {config.material}
                                    </Typography>
                                    <Typography variant="body2">
                                        Short Circuit: {config.shortCircuitCurrent}kA
                                    </Typography>
                                    <Typography variant="body2">
                                        Size: {config.width}mm x {config.thickness}mm
                                    </Typography>
                                </CardContent>
                                <CardActions>
                                    <Button size="small" onClick={() => handleConfigSelect(config)}>
                                        Use This Configuration
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Busbar Calculator
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <form id="busbarForm" onSubmit={handleSubmit(onSubmit)} action="javascript:void(0);">


                    <Grid container spacing={3}>
                        {/* Basic Parameters */}
                        <Grid item xs={12} md={4}>
                            <Controller
                                name="current"
                                control={control}
                                rules={{ required: 'Current is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Current (A)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.current}
                                        helperText={errors.current?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="voltage"
                                control={control}
                                rules={{ required: 'Voltage is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Voltage (kV)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.voltage}
                                        helperText={errors.voltage?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Voltage Level</InputLabel>
                                <Controller
                                    name="voltageLevel"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Voltage Level">
                                            {voltageLevels.map((level) => (
                                                <MenuItem key={level} value={level}>
                                                    {level}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Material</InputLabel>
                                <Controller
                                    name="material"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Material">
                                            {materials.map((mat) => (
                                                <MenuItem key={mat} value={mat}>
                                                    {mat}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="ambientTemperature"
                                control={control}
                                rules={{ min: { value: -50, message: 'Invalid temperature' }, max: { value: 100, message: 'Invalid temperature' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Ambient Temperature (°C)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.ambientTemperature}
                                        helperText={errors.ambientTemperature?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Arrangement</InputLabel>
                                <Controller
                                    name="arrangement"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="Arrangement">
                                            <MenuItem value="Horizontal">Horizontal</MenuItem>
                                            <MenuItem value="Vertical">Vertical</MenuItem>
                                            <MenuItem value="Flat">Flat</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Busbar Dimensions
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="busbarWidth"
                                control={control}
                                rules={{ required: 'Width is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Width (mm)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.busbarWidth}
                                        helperText={errors.busbarWidth?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="busbarThickness"
                                control={control}
                                rules={{ required: 'Thickness is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Thickness (mm)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.busbarThickness}
                                        helperText={errors.busbarThickness?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Controller
                                name="busbarLength"
                                control={control}
                                rules={{ required: 'Length is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Length (mm)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.busbarLength}
                                        helperText={errors.busbarLength?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="h6" gutterBottom>
                                Short Circuit Parameters
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="shortCircuitCurrent"
                                control={control}
                                rules={{
                                    required: 'Short Circuit Current is required',
                                    min: { value: 0, message: 'Must be positive' }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Short Circuit Current (kA)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.shortCircuitCurrent}
                                        helperText={errors.shortCircuitCurrent?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="phaseDistance"
                                control={control}
                                rules={{ min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phase Distance (mm)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.phaseDistance}
                                        helperText={errors.phaseDistance?.message}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={advancedMode}
                                        onChange={(e) => setAdvancedMode(e.target.checked)}
                                    />
                                }
                                label="Show Advanced Options"
                            />
                        </Grid>

                        {advancedMode && (
                            <>
                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Advanced Options
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Controller
                                        name="numberOfBarsPerPhase"
                                        control={control}
                                        rules={{ min: { value: 1, message: 'Minimum is 1' }, max: { value: 10, message: 'Maximum is 10' } }}
                                        render={({ field }) => (
                                            <TextField
                                                {...field}
                                                label="Number of Bars Per Phase"
                                                type="number"
                                                fullWidth
                                                error={!!errors.numberOfBarsPerPhase}
                                                helperText={errors.numberOfBarsPerPhase?.message}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        control={
                                            <Controller
                                                name="useAdvancedCalculation"
                                                control={control}
                                                render={({ field }) => (
                                                    <Checkbox
                                                        checked={field.value}
                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                    />
                                                )}
                                            />
                                        }
                                        label="Use Advanced FEM Calculation"
                                    />
                                </Grid>
                            </>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    disabled={isLoading}
                                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                                    form="busbarForm"
                                >
                                    {isLoading ? 'Calculating...' : 'Calculate'}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outlined"
                                    onClick={() => reset()}
                                >
                                    Reset Form
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </>
    );
};

export default BusbarForm;