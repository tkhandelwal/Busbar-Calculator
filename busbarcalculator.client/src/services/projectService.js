// src/services/projectService.js
import axios from 'axios';

const API_URL = '/api';

export const getProjects = async () => {
    try {
        const response = await axios.get(`${API_URL}/project`);
        return response.data;
    } catch (error) {
        console.error('Error fetching projects:', error);
        throw error;
    }
};

export const getProject = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/project/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        throw error;
    }
};

export const createProject = async (projectData) => {
    try {
        const response = await axios.post(`${API_URL}/project`, projectData);
        return response.data;
    } catch (error) {
        console.error('Error creating project:', error);
        throw error;
    }
};

export const updateProject = async (id, projectData) => {
    try {
        const response = await axios.put(`${API_URL}/project/${id}`, projectData);
        return response.data;
    } catch (error) {
        console.error(`Error updating project ${id}:`, error);
        throw error;
    }
};

export const deleteProject = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/project/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting project ${id}:`, error);
        throw error;
    }
};