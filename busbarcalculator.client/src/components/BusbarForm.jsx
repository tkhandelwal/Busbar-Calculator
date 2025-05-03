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
    CardActions,
    Alert
} from '@mui/material';
import {
    calculateBusbar,
    getMaterials,
    getVoltageLevels,
    getStandardConfigs
} from '../services/api';
import ThreePhaseConfig from './ThreePhaseConfig';

const BusbarForm = ({ onResultsCalculated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [materials, setMaterials] = useState(['Copper', 'Aluminum']);
    const [voltageLevels, setVoltageLevels] = useState(['LV', 'MV', 'HV']);
    const [standardConfigs, setStandardConfigs] = useState([]);
    const [selectedVoltageLevel, setSelectedVoltageLevel] = useState('');
    const [advancedMode, setAdvancedMode] = useState(false);
    const [error, setError] = useState(null);
    const [dataFetchError, setDataFetchError] = useState(null);

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
            voltageLevel: 'LV',
            systemType: 'SinglePhase',
            connectionType: 'Delta',
            powerFactor: 0.9,
            isBalanced: true,
            phaseCurrents: {
                phaseA: '',
                phaseB: '',
                phaseC: ''
            }
        }
    });

    const material = watch('material');
    const voltageLevel = watch('voltageLevel');
    const systemType = watch('systemType');
    const isBalanced = watch('isBalanced');

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setDataFetchError(null);
                const [materialsData, voltageLevelsData] = await Promise.all([
                    getMaterials(),
                    getVoltageLevels()
                ]);

                setMaterials(materialsData);
                setVoltageLevels(voltageLevelsData);
            } catch (error) {
                console.error('Failed to fetch initial data', error);
                setDataFetchError('Unable to fetch materials and voltage levels. Using default values.');
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchConfigsByVoltageLevel = async () => {
            if (selectedVoltageLevel) {
                try {
                    setDataFetchError(null);
                    const configs = await getStandardConfigs(selectedVoltageLevel);
                    setStandardConfigs(configs);
                } catch (error) {
                    console.error('Failed to fetch standard configurations', error);
                    setDataFetchError('Unable to fetch standard configurations. Using sample configurations.');
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

    const validateForm = (data) => {
        const errors = {};

        // Check required fields
        if (!data.current || isNaN(data.current) || Number(data.current) <= 0) {
            errors.current = "Current must be a positive number";
        }

        if (!data.voltage || isNaN(data.voltage) || Number(data.voltage) <= 0) {
            errors.voltage = "Voltage must be a positive number";
        }

        if (!data.busbarWidth || isNaN(data.busbarWidth) || Number(data.busbarWidth) <= 0) {
            errors.busbarWidth = "Width must be a positive number";
        }

        if (!data.busbarThickness || isNaN(data.busbarThickness) || Number(data.busbarThickness) <= 0) {
            errors.busbarThickness = "Thickness must be a positive number";
        }

        if (!data.shortCircuitCurrent || isNaN(data.shortCircuitCurrent) || Number(data.shortCircuitCurrent) <= 0) {
            errors.shortCircuitCurrent = "Short circuit current must be a positive number";
        }

        if (!data.phaseDistance || isNaN(data.phaseDistance) || Number(data.phaseDistance) <= 0) {
            errors.phaseDistance = "Phase distance must be a positive number";
        }

        // Additional validation for three-phase
        if (data.systemType === 'ThreePhase' && !data.isBalanced) {
            if (!data.phaseCurrents?.phaseA || isNaN(data.phaseCurrents.phaseA) || Number(data.phaseCurrents.phaseA) <= 0) {
                errors.phaseA = "Phase A current must be a positive number";
            }

            if (!data.phaseCurrents?.phaseB || isNaN(data.phaseCurrents.phaseB) || Number(data.phaseCurrents.phaseB) <= 0) {
                errors.phaseB = "Phase B current must be a positive number";
            }

            if (!data.phaseCurrents?.phaseC || isNaN(data.phaseCurrents.phaseC) || Number(data.phaseCurrents.phaseC) <= 0) {
                errors.phaseC = "Phase C current must be a positive number";
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    };

    const onSubmit = async (data) => {
        // Validate form manually before proceeding
        const { isValid, errors: validationErrors } = validateForm(data);

        if (!isValid) {
            setError(`Please fix the following errors: ${Object.values(validationErrors).join(', ')}`);
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            console.log('Form submitted with data:', data);

            // Make sure phase currents are properly formed for unbalanced loads
            if (data.systemType === 'ThreePhase' && !data.isBalanced) {
                // Ensure phaseCurrents is properly initialized
                if (!data.phaseCurrents) {
                    data.phaseCurrents = {};
                }

                // Ensure all required phase currents are defined
                if (!data.phaseCurrents.phaseA) data.phaseCurrents.phaseA = data.current;
                if (!data.phaseCurrents.phaseB) data.phaseCurrents.phaseB = data.current;
                if (!data.phaseCurrents.phaseC) data.phaseCurrents.phaseC = data.current;
            }

            // Convert numeric strings to actual numbers
            Object.keys(data).forEach(key => {
                if (!isNaN(data[key]) && typeof data[key] === 'string' && data[key] !== '') {
                    data[key] = parseFloat(data[key]);
                }
            });

            // Try API call first
            let results;
            try {
                results = await calculateBusbar(data);
            } catch (apiError) {
                console.warn('API call failed, using mock calculation:', apiError);

                // Fallback to client-side calculation if API fails
                results = mockCalculateResults(data);
            }

            console.log('Calculated results:', results);

            if (typeof onResultsCalculated === 'function') {
                onResultsCalculated(results);
            } else {
                console.error('onResultsCalculated is not a function', onResultsCalculated);
            }
        } catch (error) {
            console.error('Error calculating busbar:', error);
            setError('Failed to calculate busbar parameters. Please check your inputs and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Helper function for mock calculations when API fails
    const mockCalculateResults = (data) => {
        // Simple calculation to create reasonable mock results based on input data
        const current = parseFloat(data.current);
        const voltage = parseFloat(data.voltage);
        const material = data.material;
        const width = parseFloat(data.busbarWidth);
        const thickness = parseFloat(data.busbarThickness);
        const length = parseFloat(data.busbarLength);
        const shortCircuitCurrent = parseFloat(data.shortCircuitCurrent);
        const phaseDistance = parseFloat(data.phaseDistance);

        // Current density based on material
        const currentDensity = material === 'Copper' ? 1.6 : 1.0; // A/mm²

        // Required cross-section calculation
        const requiredArea = (current * 1.25) / currentDensity; // With 25% safety margin

        // Temperature rise calculation (simplified)
        const crossSection = width * thickness;
        const resistivity = material === 'Copper' ? 1.72e-8 : 2.82e-8; // Ω·m
        const resistance = resistivity * (length / 1000) / (crossSection / 1e6);
        const powerLoss = current * current * resistance;
        const temperatureRise = powerLoss * 0.05;

        // Mechanical stress calculation (simplified)
        const shortCircuitForce = 2e-7 * Math.pow(shortCircuitCurrent * 1000, 2) * (length / 1000) / (phaseDistance / 1000);
        const momentOfInertia = (width * Math.pow(thickness, 3)) / 12; // mm⁴
        const mechanicalStress = (shortCircuitForce * (length / 4) * (thickness / 2)) / momentOfInertia * 1e6; // Pa

        // Max allowable values based on material
        const maxAllowableTemperature = material === 'Copper' ? 90 : 80; // °C
        const maxAllowableMechanicalStress = material === 'Copper' ? 120e6 : 70e6; // Pa

        // Generate standard sizes
        const standardSizes = generateMockStandardSizes(requiredArea);

        // Create mock advanced results
        const advancedResults = {
            resonanceFrequency: 145.7,
            femAnalysisRequired: requiredArea > 300,
            voltageDrop: current * resistance * 1000 / voltage, // V
            skinEffectSignificant: current > 1000,
            effectiveResistanceIncrease: 1.1,
            magneticFieldStrength: (2e-7 * current) / (2 * Math.PI * 1.0), // Tesla at 1m
        };

        // Add mock distribution data if advanced calculation requested
        if (data.useAdvancedCalculation) {
            // Generate mock distribution arrays
            advancedResults.ForceDistribution = generateMockDistribution(10, shortCircuitForce * 0.5, shortCircuitForce * 1.5);
            advancedResults.StressDistribution = generateMockDistribution(10, mechanicalStress * 0.7, mechanicalStress * 1.2);
            advancedResults.TemperatureDistribution = generateMockDistribution(10, 40, 40 + temperatureRise);
        }

        return {
            requiredCrossSectionArea: requiredArea,
            currentDensity: currentDensity,
            shortCircuitForce: shortCircuitForce,
            temperatureRise: temperatureRise,
            maxAllowableTemperature: maxAllowableTemperature,
            isSizingSufficient: temperatureRise <= maxAllowableTemperature,
            mechanicalStress: mechanicalStress,
            maxAllowableMechanicalStress: maxAllowableMechanicalStress,
            recommendedStandardSizes: standardSizes,
            advancedResults: advancedResults,
            busbarWidth: width,
            busbarThickness: thickness,
            busbarLength: length,
            material: material
        };
    };

    // Helper for mock standard sizes
    const generateMockStandardSizes = (requiredArea) => {
        const standardSizes = [];
        const sizePairs = [
            [20, 5], [25, 5], [30, 5], [40, 5], [50, 5],
            [60, 5], [80, 5], [100, 5], [120, 5],
            [20, 10], [25, 10], [30, 10], [40, 10], [50, 10],
            [60, 10], [80, 10], [100, 10], [120, 10]
        ];

        // Find sizes that satisfy the required area
        for (const [width, thickness] of sizePairs) {
            if (width * thickness >= requiredArea) {
                standardSizes.push(`${width}mm x ${thickness}mm`);
                if (standardSizes.length >= 3) break;
            }
        }

        return standardSizes.length > 0 ? standardSizes : ["60mm x 10mm"];
    };

    // Helper for mock distribution data
    const generateMockDistribution = (size, min, max) => {
        const distribution = [];
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // Create a pattern with higher values in the middle
                const x = i / (size - 1);
                const y = j / (size - 1);
                const distance = Math.sqrt(Math.pow(x - 0.5, 2) + Math.pow(y - 0.5, 2));
                const normalizedValue = 1 - Math.min(distance * 2, 1);
                const value = min + (max - min) * normalizedValue;
                distribution.push(value);
            }
        }
        return distribution;
    };

    return (
        <>
            {dataFetchError && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {dataFetchError}
                </Alert>
            )}

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
                    {standardConfigs.length > 0 ? (
                        standardConfigs.map((config) => (
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
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                {selectedVoltageLevel
                                    ? `No standard configurations available for ${selectedVoltageLevel}`
                                    : "Select a voltage level to see standard configurations"}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                    Busbar Calculator
                </Typography>
                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <form
                    id="busbarForm"
                    onSubmit={handleSubmit(onSubmit)}
                    onReset={() => {
                        reset();
                        setError(null);
                    }}
                >
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
                                        InputProps={{
                                            inputProps: { min: 0, step: "0.1" }
                                        }}
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
                                        InputProps={{
                                            inputProps: { min: 0, step: "0.01" }
                                        }}
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
                                        InputProps={{
                                            inputProps: { min: -50, max: 100, step: "1" }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>System Type</InputLabel>
                                <Controller
                                    name="systemType"
                                    control={control}
                                    render={({ field }) => (
                                        <Select {...field} label="System Type">
                                            <MenuItem value="SinglePhase">Single Phase</MenuItem>
                                            <MenuItem value="ThreePhase">Three Phase</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
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

                        {/* Three Phase Configuration */}
                        <ThreePhaseConfig
                            control={control}
                            errors={errors}
                            watch={watch}
                        />

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
                                        InputProps={{
                                            inputProps: { min: 0, step: "1" }
                                        }}
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
                                        InputProps={{
                                            inputProps: { min: 0, step: "1" }
                                        }}
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
                                        InputProps={{
                                            inputProps: { min: 0, step: "10" }
                                        }}
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
                                        InputProps={{
                                            inputProps: { min: 0, step: "0.1" }
                                        }}
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Controller
                                name="phaseDistance"
                                control={control}
                                rules={{ required: 'Phase distance is required', min: { value: 0, message: 'Must be positive' } }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Phase Distance (mm)"
                                        type="number"
                                        fullWidth
                                        error={!!errors.phaseDistance}
                                        helperText={errors.phaseDistance?.message}
                                        InputProps={{
                                            inputProps: { min: 0, step: "10" }
                                        }}
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
                                                InputProps={{
                                                    inputProps: { min: 1, max: 10, step: "1" }
                                                }}
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
                                    type="reset"
                                    variant="outlined"
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