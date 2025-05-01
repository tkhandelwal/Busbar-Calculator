// src/services/authService.js
import axios from 'axios';

const API_URL = '/api';

export const login = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/user/login`, { email, password });

        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setAuthHeader(response.data.token);
        }

        return response.data;
    } catch (error) {
        throw error;
    }
};

export const register = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/user/register`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('user');
    removeAuthHeader();
};

export const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

export const isAuthenticated = () => {
    const user = getCurrentUser();
    return !!user;
};

export const setAuthHeader = (token) => {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeAuthHeader = () => {
    delete axios.defaults.headers.common['Authorization'];
};

export const initializeAuth = () => {
    const user = getCurrentUser();
    if (user && user.token) {
        setAuthHeader(user.token);
    }
};