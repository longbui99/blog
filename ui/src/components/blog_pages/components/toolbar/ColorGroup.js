import React from 'react';
import './styles/ColorGroup.css';

const ColorGroup = ({ onColorChange }) => {
    const colorGroups = [
        {
            title: "Dynamic Theme Colors",
            colors: [
                { color: 'var(--text-primary)', label: 'Text Primary' },
                { color: 'var(--text-secondary)', label: 'Text Secondary' },
                { color: 'var(--link-color)', label: 'Link' },
                { color: 'var(--link-hover)', label: 'Link Hover' },
            ]
        },
        {
            title: "Basic Colors",
            colors: [
                // First row - Rainbow colors
                { color: 'var(--red-500)', label: 'Red' },
                { color: 'var(--orange-500)', label: 'Orange' },
                { color: 'var(--yellow-500)', label: 'Yellow' },
                { color: 'var(--green-500)', label: 'Green' },
                { color: 'var(--blue-500)', label: 'Blue' },
                { color: 'var(--indigo-500)', label: 'Indigo' },
                { color: 'var(--violet-500)', label: 'Violet' },
                
                // Second row - Additional colors
                { color: 'var(--purple-500)', label: 'Purple' },
                { color: 'var(--pink-500)', label: 'Pink' },
                { color: 'var(--neutral-50)', label: 'White' },
                { color: 'var(--neutral-200)', label: 'Light Gray' },
                { color: 'var(--neutral-500)', label: 'Gray' },
                { color: 'var(--neutral-700)', label: 'Dark Gray' },
                { color: 'var(--neutral-900)', label: 'Black' },
            ]
        },
        {
            title: "Red Shades",
            colors: [
                { color: 'var(--red-50)', label: 'Lightest Red' },
                { color: 'var(--red-100)', label: 'Light Red' },
                { color: 'var(--red-500)', label: 'Red' },
                { color: 'var(--red-700)', label: 'Dark Red' },
                { color: 'var(--red-900)', label: 'Darkest Red' },
            ]
        },
        {
            title: "Blue Shades",
            colors: [
                { color: 'var(--blue-50)', label: 'Lightest Blue' },
                { color: 'var(--blue-100)', label: 'Light Blue' },
                { color: 'var(--blue-500)', label: 'Blue' },
                { color: 'var(--blue-700)', label: 'Dark Blue' },
                { color: 'var(--blue-900)', label: 'Darkest Blue' },
            ]
        },
        {
            title: "Green Shades",
            colors: [
                { color: 'var(--green-50)', label: 'Lightest Green' },
                { color: 'var(--green-100)', label: 'Light Green' },
                { color: 'var(--green-500)', label: 'Green' },
                { color: 'var(--green-700)', label: 'Dark Green' },
                { color: 'var(--green-900)', label: 'Darkest Green' },
            ]
        },
        {
            title: "Accent Colors",
            colors: [
                { color: 'var(--teal-500)', label: 'Teal' },
                { color: 'var(--cyan-500)', label: 'Cyan' },
                { color: 'var(--rose-500)', label: 'Rose' },
                { color: 'var(--indigo-500)', label: 'Indigo' },
                { color: 'var(--violet-500)', label: 'Violet' },
            ]
        }
    ];

    return (
        <div className="color-picker">
            {colorGroups.map((group) => (
                <div key={group.title} className="color-group">
                    <span className="color-group-title">{group.title}</span>
                    <div className="color-buttons">
                        {group.colors.map(({ color, label }) => (
                            <button
                                key={color}
                                className="color-btn"
                                style={{ backgroundColor: color }}
                                onClick={() => onColorChange(color)}
                                title={label}
                            >
                                <span className="color-label">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ColorGroup; 