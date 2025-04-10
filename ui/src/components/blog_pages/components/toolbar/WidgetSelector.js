import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSitemap, faFolder } from '@fortawesome/free-solid-svg-icons';
import './styles/WidgetSelector.css';

const WidgetSelector = ({ onWidgetInsert }) => {
    const widgets = [
        { type: 'pagetree', label: 'Page Tree', icon: faSitemap },
        { type: 'category', label: 'Category', icon: faFolder }
    ];

    return (
        <div className="widget-selector-menu">
            {widgets.map(widget => (
                <button
                    key={widget.type}
                    className="widget-selector-item"
                    onClick={() => onWidgetInsert(widget.type)}
                    title={widget.label}
                >
                    <div className="widget-selector-content">
                        <FontAwesomeIcon icon={widget.icon} className="widget-selector-icon" />
                        <span className="widget-selector-label">{widget.label}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default WidgetSelector;
