// src/services/api.js
import axios from 'axios';

// Use relative URL with Vite proxy
const API_URL = '/api';

// Add timeouts for better error handling
axios.defaults.timeout = 30000; // Increase timeout to 30 seconds

// Add interceptors for debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request', JSON.stringify({
        url: request.url,
        method: request.method,
        data: request.data
    }));
    return request;
});

axios.interceptors.response.use(
    response => {
        console.log('Response:', JSON.stringify({
            status: response.status,
            url: response.config.url,
            data: response.data ? 'Data received' : 'No data'
        }));
        return response;
    },
    error => {
        console.error('Response Error:', error.message);
        if (error.response) {
            console.error('Error details:', {
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            console.error('No response received:', error.request);
        }
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
        console.log('Calculating busbar with data:', inputData);
        const response = await axios.post(`${API_URL}/busbar/calculate`, inputData);
        return response.data;
    } catch (error) {
        console.error('Error calculating busbar:', error);
        if (process.env.NODE_ENV === 'development') {
            console.warn('Using mock data due to API error');
            return MOCK_BUSBAR_RESULT;
        }
        throw error; // In production, let the caller handle the error
    }
};

export const getMaterials = async () => {
    try {
        console.log('Fetching materials');
        const response = await axios.get(`${API_URL}/busbar/materials`);
        return response.data;
    } catch (error) {
        console.error('Error fetching materials:', error);
        console.warn('Using mock materials due to API error');
        return MOCK_MATERIALS;
    }
};

export const getVoltageLevels = async () => {
    try {
        console.log('Fetching voltage levels');
        const response = await axios.get(`${API_URL}/busbar/voltage-levels`);
        return response.data;
    } catch (error) {
        console.error('Error fetching voltage levels:', error);
        console.warn('Using mock voltage levels due to API error');
        return MOCK_VOLTAGE_LEVELS;
    }
};

export const getStandardConfigs = async (voltageLevel = null) => {
    try {
        const url = voltageLevel
            ? `${API_URL}/busbar/standard-configs?voltageLevel=${voltageLevel}`
            : `${API_URL}/busbar/standard-configs`;

        console.log('Fetching standard configs from:', url);
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching standard configs:', error);
        console.warn('Using mock configs due to API error');

        if (voltageLevel) {
            return MOCK_STANDARD_CONFIGS.filter(config => config.voltageLevel === voltageLevel);
        }
        return MOCK_STANDARD_CONFIGS;
    }
};

export const getStandardConfigById = async (id) => {
    try {
        console.log('Fetching config by ID:', id);
        const response = await axios.get(`${API_URL}/busbar/standard-configs/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching standard config:', error);
        console.warn('Using mock config due to API error');
        return MOCK_STANDARD_CONFIGS.find(config => config.id === id) || null;
    }
};