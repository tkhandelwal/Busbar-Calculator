// BusbarCharts.jsx
import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const BusbarCharts = ({ results }) => {
    if (!results) return null;

    // Configuration for temperature rise chart
    const temperatureOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Temperature Analysis',
            },
        },
    };

    const temperatureData = {
        labels: ['Current Temperature', 'Maximum Allowable'],
        datasets: [
            {
                label: 'Temperature (°C)',
                data: [results.temperatureRise + 40, results.maxAllowableTemperature], // Adding ambient temp
                backgroundColor: [
                    results.temperatureRise + 40 >= results.maxAllowableTemperature ?
                        'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
            },
        ],
    };

    // Configuration for mechanical stress chart
    const stressOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Mechanical Stress Analysis',
            },
        },
    };

    const stressData = {
        labels: ['Current Stress', 'Maximum Allowable'],
        datasets: [
            {
                label: 'Stress (MPa)',
                // Convert Pa to MPa for better readability
                data: [results.mechanicalStress / 1e6, results.maxAllowableMechanicalStress / 1e6],
                backgroundColor: [
                    results.mechanicalStress >= results.maxAllowableMechanicalStress ?
                        'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                ],
            },
        ],
    };

    return (
        <div className="charts-container">
            <div className="chart-row" style={{ display: 'flex', marginBottom: '30px' }}>
                <div style={{ flex: 1, marginRight: '15px' }}>
                    <Bar options={temperatureOptions} data={temperatureData} />
                </div>
                <div style={{ flex: 1, marginLeft: '15px' }}>
                    <Bar options={stressOptions} data={stressData} />
                </div>
            </div>

            {results.advancedResults && (
                <div className="advanced-charts">
                    <h3>Advanced Analysis Results</h3>
                    <div className="chart-row" style={{ marginTop: '20px' }}>
                        {/* Add advanced charts using data from FEM analysis */}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusbarCharts;