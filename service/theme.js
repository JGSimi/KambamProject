import requests from './request.js';
import user from './user.js';

const themes = {
    light: {
        '--primary-color': '#007AFF',
        '--background-color': '#f5f5f7',
        '--card-background': 'rgba(255, 255, 255, 0.8)',
        '--text-color': '#1d1d1f',
        '--text-secondary': '#666666',
        '--border-color': 'rgba(0, 0, 0, 0.1)',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)',
        '--hover-shadow': 'rgba(0, 0, 0, 0.15)'
    },
    dark: {
        '--primary-color': '#0A84FF',
        '--background-color': '#1c1c1e',
        '--card-background': 'rgba(44, 44, 46, 0.8)',
        '--text-color': '#ffffff',
        '--text-secondary': '#98989d',
        '--border-color': 'rgba(255, 255, 255, 0.1)',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)',
        '--hover-shadow': 'rgba(0, 0, 0, 0.4)'
    }
};

const theme = {
    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.current = savedTheme;
        document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    },

    toggle() {
        const newTheme = this.current === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        this.current = newTheme;
        document.body.classList.toggle('dark-theme');
        return this.current;
    },

    get current() {
        return localStorage.getItem('theme') || 'light';
    },

    set current(value) {
        localStorage.setItem('theme', value);
    }
};

export default theme; 