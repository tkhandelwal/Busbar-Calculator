// src/services/api.js
import axios from 'axios';

// Use relative URL with Vite proxy
const API_URL = '/api';

// Debug logging
console.log('API URL:', API_URL);

// Add timeouts and interceptors for debugging
axios.defaults.timeout = 10000;

axios.interceptors.request.use(request => {
    console.log('Starting Request', request);
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', response);
        return response;
    },
    error => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

// Mock data for fallback if API fails
const MOCK_BUSBAR_RESULT = {
    requiredCrossSectionArea: 450.0,
    currentDensity: 1.6,
    shortCircuitForce: 2500.0,
    temperatureRise: 45.0,
    maxAllowableTemperature: 90.0,
    isSizingSufficient: true,
    mechanicalStress: 75000000.0,
    maxAllowableMechanicalStress: 120000000.0,
    recommendedStandardSizes: [
        "50mm x 10mm",
        "60mm x 8mm",
        "80mm x 6mm"
    ],
    advancedResults: {
        resonanceFrequency: 145.7,
        femAnalysisRequired: true
    }
};

const MOCK_MATERIALS = ['Copper', 'Aluminum'];

const MOCK_VOLTAGE_LEVELS = ['LV', 'MV', 'HV'];

const MOCK_STANDARD_CONFIGS = [
    {
        id: "lv-1",
        name: "LV Distribution Panel",
        voltageLevel: "LV",
        voltage: 0.4,
        current: 800,
        material: "Copper",
        width: 60,
        thickness: 10,
        shortCircuitCurrent: 50,
        phaseDistance: 200,
        description: "Standard configuration for low voltage distribution panels"
    },
    {
        id: "mv-1",
        name: "MV Distribution 11kV",
        voltageLevel: "MV",
        voltage: 11,
        current: 1250,
        material: "Copper",
        width: 100,
        thickness: 10,
        shortCircuitCurrent: 25,
        phaseDistance: 450,
        description: "Standard MV distribution at 11kV"
    },
    {
        id: "hv-1",
        name: "HV Substation 110kV",
        voltageLevel: "HV",
        voltage: 110,
        current: 2500,
        material: "Aluminum",
        width: 200,
        thickness: 20,
        shortCircuitCurrent: 40,
        phaseDistance: 1500,
        description: "High voltage substation busbar arrangement"
    }
];

export const calculateBusbar = async (inputData) => {
    try {
        const response = await axios.post(`${API_URL}/busbar/calculate`, inputData);
        return response.data;
    } catch (error) {
        console.error('Error calculating busbar:', error);
        console.warn('Using mock data due to API error');
        return MOCK_BUSBAR_RESULT;
    }
};

export const getMaterials = async () => {
    try {
        const response = await axios.get(`${API_URL}/busbar/materials`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials:', error);
        return MOCK_MATERIALS;
    }
};

export const getVoltageLevels = async () => {
    try {
        const response = await axios.get(`${API_URL}/busbar/voltage-levels`);
        return response.data;
    } catch (error) {
        console.error('Error fetching voltage levels:', error);
        return MOCK_VOLTAGE_LEVELS;
    }
};

export const getStandardConfigs = async (voltageLevel = null) => {
    try {
        const url = voltageLevel
            ? `${API_URL}/busbar/standard-configs?voltageLevel=${voltageLevel}`
            : `${API_URL}/busbar/standard-configs`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching standard configs:', error);
        return MOCK_STANDARD_CONFIGS;
    }
};

export const getStandardConfigById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/busbar/standard-configs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching standard config:', error);
        return MOCK_STANDARD_CONFIGS.find(config => config.id === id) || null;
    }
};