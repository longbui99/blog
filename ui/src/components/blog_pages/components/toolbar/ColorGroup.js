import React from 'react';

const ColorGroup = ({ onColorChange }) => {
    const colors = [
        { color: 'var(--text-primary)', label: 'Default Text' },
        { color: 'var(--primary-500)', label: 'Primary Red' },
        { color: '#166534', label: 'Forest' },
        { color: '#1e3a8a', label: 'Navy' },
        { color: '#f59e0b', label: 'Amber' },
        { color: '#7c3aed', label: 'Violet' },
        { color: '#0ea5e9', label: 'Sky' },
        { color: 'var(--neutral-400)', label: 'Gray' },
        { color: '#881337', label: 'Wine' },
        { color: '#10b981', label: 'Emerald' }
    ];

    return (
        <div className="toolbar-group color-group">
            {colors.map(({ color, label }) => (
                <button
                    key={color}
                    className="color-btn"
                    style={{ backgroundColor: color }}
                    onClick={() => onColorChange(color)}
                    title={label}
                />
            ))}
        </div>
    );
};

export default ColorGroup; 