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
    current: 'light',

    init() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },

    setTheme(themeName) {
        if (!themes[themeName]) return;

        this.current = themeName;
        localStorage.setItem('theme', themeName);
        
        Object.entries(themes[themeName]).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });

        document.body.classList.toggle('dark-theme', themeName === 'dark');
    },

    toggle() {
        const newTheme = this.current === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }
};

export default theme; 