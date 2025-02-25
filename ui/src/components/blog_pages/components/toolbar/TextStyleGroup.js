import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUnderline, 
    faStrikethrough, 
    faSubscript, 
    faSuperscript, 
    faCode, 
    faEraser 
} from '@fortawesome/free-solid-svg-icons';
import './styles/TextStyleGroup.css';

const TextStyleGroup = ({ onTextStyle }) => {
    const textStyles = [
        { command: 'underline', label: 'Underline', icon: faUnderline },
        { command: 'strikeThrough', label: 'Strikethrough', icon: faStrikethrough },
        { command: 'subscript', label: 'Subscript', icon: faSubscript },
        { command: 'superscript', label: 'Superscript', icon: faSuperscript },
        { command: 'code', label: 'Code', icon: faCode },
        { command: 'removeFormat', label: 'Clear formatting', icon: faEraser }
    ];

    return (
        <div className="text-style-menu">
            {textStyles.map(style => (
                <button
                    key={style.command}
                    className="text-style-item"
                    onClick={() => onTextStyle(style.command)}
                    title={style.label}
                >
                    <div className="text-style-content">
                        <FontAwesomeIcon icon={style.icon} className="text-style-icon" />
                        <span className="text-style-label">{style.label}</span>
                    </div>
                </button>
            ))}
        </div>
    );
};

export default TextStyleGroup;