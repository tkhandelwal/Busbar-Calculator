// src/components/ThreePhaseConfig.jsx
import React from 'react';
import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    FormControlLabel,
    Checkbox,
    Typography,
    Divider
} from '@mui/material';
import { Controller } from 'react-hook-form';

const ThreePhaseConfig = ({ control, errors, watch }) => {
    const systemType = watch('systemType');
    const isBalanced = watch('isBalanced');

    if (systemType !== 'ThreePhase') {
        return null;
    }

    return (
        <>
            <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                    Three-Phase Configuration
                </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                    <InputLabel>Connection Type</InputLabel>
                    <Controller
                        name="connectionType"
                        control={control}
                        render={({ field }) => (
                            <Select {...field} label="Connection Type">
                                <MenuItem value="Delta">Delta (Δ)</MenuItem>
                                <MenuItem value="Star">Star (Y)</MenuItem>
                            </Select>
                        )}
                    />
                </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
                <Controller
                    name="lineVoltage"
                    control={control}
                    rules={{ required: 'Line voltage is required', min: { value: 0, message: 'Must be positive' } }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Line Voltage (V)"
                            type="number"
                            fullWidth
                            error={!!errors.lineVoltage}
                            helperText={errors.lineVoltage?.message}
                        />
                    )}
                />
            </Grid>

            <Grid item xs={12} md={4}>
                <Controller
                    name="powerFactor"
                    control={control}
                    rules={{ required: 'Power factor is required', min: { value: 0, message: 'Must be between 0 and 1' }, max: { value: 1, message: 'Must be between 0 and 1' } }}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Power Factor"
                            type="number"
                            fullWidth
                            inputProps={{ step: 0.01, min: 0, max: 1 }}
                            error={!!errors.powerFactor}
                            helperText={errors.powerFactor?.message}
                        />
                    )}
                />
            </Grid>

            <Grid item xs={12}>
                <FormControlLabel
                    control={
                        <Controller
                            name="isBalanced"
                            control={control}
                            render={({ field }) => (
                                <Checkbox
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                />
                            )}
                        />
                    }
                    label="Balanced Load"
                />
            </Grid>

            {!isBalanced && (
                <>
                    <Grid item xs={12} md={4}>
                        <Controller
                            name="phaseCurrents.phaseA"
                            control={control}
                            rules={{ required: 'Phase A current is required', min: { value: 0, message: 'Must be positive' } }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phase A Current (A)"
                                    type="number"
                                    fullWidth
                                    error={!!errors.phaseCurrents?.phaseA}
                                    helperText={errors.phaseCurrents?.phaseA?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="phaseCurrents.phaseB"
                            control={control}
                            rules={{ required: 'Phase B current is required', min: { value: 0, message: 'Must be positive' } }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phase B Current (A)"
                                    type="number"
                                    fullWidth
                                    error={!!errors.phaseCurrents?.phaseB}
                                    helperText={errors.phaseCurrents?.phaseB?.message}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Controller
                            name="phaseCurrents.phaseC"
                            control={control}
                            rules={{ required: 'Phase C current is required', min: { value: 0, message: 'Must be positive' } }}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Phase C Current (A)"
                                    type="number"
                                    fullWidth
                                    error={!!errors.phaseCurrents?.phaseC}
                                    helperText={errors.phaseCurrents?.phaseC?.message}
                                />
                            )}
                        />
                    </Grid>
                </>
            )}
        </>
    );
};

export default ThreePhaseConfig;