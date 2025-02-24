import React from 'react';

const HeadingGroup = ({ onHeading }) => {
    const headings = [
        { tag: 'h1', label: 'Heading 1', text: 'H1' },
        { tag: 'h2', label: 'Heading 2', text: 'H2' },
        { tag: 'h3', label: 'Heading 3', text: 'H3' },
        { tag: 'h4', label: 'Heading 4', text: 'H4' },
        { tag: 'h5', label: 'Heading 5', text: 'H5' },
        { tag: 'h6', label: 'Heading 6', text: 'H6' },
        { tag: 'p', label: 'Normal', icon: 'fa-paragraph' },
    ];

    return (
        <div className="toolbar-group heading-group">
            {headings.map(({ tag, label, text, icon }) => (
                <button
                    key={tag}
                    onClick={() => onHeading(tag)}
                    title={label}
                >
                    {icon ? (
                        <i className={`fas ${icon}`}></i>
                    ) : (
                        <span className="heading-text">{text}</span>
                    )}
                </button>
            ))}
        </div>
    );
};

export default HeadingGroup; 