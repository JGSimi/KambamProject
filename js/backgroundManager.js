export function applyBackground(color, isDark) {
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    const rgb = hexToRgb(color);
    
    const backgroundStyle = isDark ? `
        linear-gradient(45deg, 
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 0%,
            rgba(0, 0, 0, 0.95) 100%
        ),
        repeating-linear-gradient(
            45deg,
            transparent 0px,
            transparent 10px,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 10px,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 20px
        ),
        repeating-linear-gradient(
            -45deg,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03) 0px,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.03) 10px,
            transparent 10px,
            transparent 20px
        ),
        radial-gradient(
            circle at 50% 50%,
            rgba(0, 0, 0, 0.9) 0%,
            rgba(0, 0, 0, 0.95) 100%
        ) !important` : `
        linear-gradient(120deg, 
            rgba(255, 255, 255, 0.95) 0%,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05) 100%
        ),
        radial-gradient(
            circle at 0% 0%,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1) 0%,
            transparent 50%
        ),
        radial-gradient(
            circle at 100% 0%,
            rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.08) 0%,
            transparent 50%
        ),
        radial-gradient(
            circle at 50% 50%,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.95) 100%
        ) !important`;
    
    document.body.style.cssText = `
        background: ${backgroundStyle};
        background-attachment: fixed !important;
    `;
} 