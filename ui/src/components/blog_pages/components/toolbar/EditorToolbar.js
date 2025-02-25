import React, { forwardRef, useState } from 'react';
import ColorGroup from './ColorGroup';
import InsertGroup from './InsertGroup';
import AlignmentGroup from './AlignmentGroup';
import HeadingGroup from './HeadingGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faHeading, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import './styles/EditorToolbar.css';

const EditorToolbar = forwardRef(({ 
    onColorChange, 
    onAlignment, 
    onLink, 
    onImage, 
    onInlineCode, 
    onCodeBlock,
    onHeading,
    onBulletList,
    onNumberList
}, ref) => {
    const [activePopup, setActivePopup] = useState(null);

    const togglePopup = (popupName) => {
        setActivePopup(activePopup === popupName ? null : popupName);
    };

    const handleClickOutside = (e) => {
        if (!e.target.closest('.toolbar-popup') && !e.target.closest('.toolbar-button')) {
            setActivePopup(null);
        }
    };

    React.useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="editor-manager">
            <div ref={ref} className="editor-toolbar">
                <div className="toolbar-group">
                    <button 
                    className={`toolbar-button ${activePopup === 'heading' ? 'active' : ''}`}
                    onClick={() => togglePopup('heading')}
                >
                    <FontAwesomeIcon icon={faHeading} />
                </button>
                {activePopup === 'heading' && (
                    <div className="toolbar-popup">
                        <HeadingGroup 
                            onHeading={(level) => {
                                onHeading(level);
                                setActivePopup(null);
                            }} 
                        />
                    </div>
                )}
            </div>

            <div className="toolbar-group">
                <button 
                    className={`toolbar-button ${activePopup === 'color' ? 'active' : ''}`}
                    onClick={() => togglePopup('color')}
                >
                    <FontAwesomeIcon icon={faPalette} />
                </button>
                {activePopup === 'color' && (
                    <div className="toolbar-popup">
                        <ColorGroup 
                            onColorChange={(color) => {
                                onColorChange(color);
                                setActivePopup(null);
                            }} 
                        />
                    </div>
                )}
            </div>

            <InsertGroup 
                onLink={onLink} 
                onImage={onImage}
                onInlineCode={onInlineCode}
                onCodeBlock={onCodeBlock}
                onBulletList={onBulletList}
                onNumberList={onNumberList}
            />

            <div className="toolbar-group">
                <button 
                    className={`toolbar-button ${activePopup === 'alignment' ? 'active' : ''}`}
                    onClick={() => togglePopup('alignment')}
                >
                    <FontAwesomeIcon icon={faAlignLeft} />
                </button>
                {activePopup === 'alignment' && (
                    <div className="toolbar-popup">
                        <AlignmentGroup 
                            onAlignment={(align) => {
                                onAlignment(align);
                                setActivePopup(null);
                            }} 
                        />
                    </div>
                )}
            </div>
        </div>
    </div>
    );
});

EditorToolbar.displayName = 'EditorToolbar';

export default EditorToolbar; 