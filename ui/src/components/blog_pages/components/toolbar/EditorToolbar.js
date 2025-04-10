import React, { forwardRef, useState } from 'react';
import ColorGroup from './ColorGroup';
import InsertGroup from './InsertGroup';
import AlignmentGroup from './AlignmentGroup';
import HeadingGroup from './HeadingGroup';
import TextStyleGroup from './TextStyleGroup';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHeading, 
    faAlignLeft, 
    faBold, 
    faItalic, 
    faEllipsisH, 
    faFont,
    faChevronDown,
    faPen,
    faSitemap
} from '@fortawesome/free-solid-svg-icons';
import WidgetSelector from './WidgetSelector';
import './styles/EditorToolbar.css';

const EditorToolbar = forwardRef(({ 
    onColorChange,
    onBackgroundColorChange,
    onAlignment, 
    onLink, 
    onImage, 
    onInlineCode, 
    onCodeBlock,
    onHeading,
    onBulletList,
    onNumberList,
    onTextStyle,
    onCheckList,
    onWidgetInsert
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

    const handleWidgetInsert = (widgetType) => {
        let widgetHTML = '';
        if (widgetType === 'pagetree') {
            widgetHTML = `
                <div class="widget pagetree-widget" contenteditable="false">
                    <div class="widget-content">Page Tree will be displayed here</div>
                </div>
            `;
        } else if (widgetType === 'category') {
            widgetHTML = `
                <div class="widget category-widget" contenteditable="false">
                    <div class="widget-content">Category will be displayed here</div>
                </div>
            `;
        }
        
        // Insert at cursor position
        document.execCommand('insertHTML', false, widgetHTML);
    };

    return (
        <div className="editor-manager">
            <div ref={ref} className="editor-toolbar">
                <div className="toolbar-group">
                    <button 
                        className={`toolbar-button dropdown-button ${activePopup === 'heading' ? 'active' : ''}`}
                        onClick={() => togglePopup('heading')}
                    >
                        <FontAwesomeIcon icon={faHeading} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
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

                <div className="toolbar-group text-style-group">
                    <button 
                        className="toolbar-button"
                        onClick={() => onTextStyle('bold')}
                    >
                        <FontAwesomeIcon icon={faBold} />
                    </button>
                    <button 
                        className="toolbar-button"
                        onClick={() => onTextStyle('italic')}
                    >
                        <FontAwesomeIcon icon={faItalic} />
                    </button>
                    <button 
                        className={`toolbar-button dropdown-button ${activePopup === 'textStyle' ? 'active' : ''}`}
                        onClick={() => togglePopup('textStyle')}
                    >
                        <FontAwesomeIcon icon={faEllipsisH} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </button>
                    {activePopup === 'textStyle' && (
                        <div className="toolbar-popup">
                            <TextStyleGroup 
                                onTextStyle={(style) => {
                                    onTextStyle(style);
                                    setActivePopup(null);
                                }} 
                            />
                        </div>
                    )}
                </div>

                <div className="toolbar-group">
                    <button 
                        className={`toolbar-button dropdown-button rainbow-border-button ${activePopup === 'color' ? 'active' : ''}`}
                        onClick={() => togglePopup('color')}
                    >
                        <FontAwesomeIcon icon={faFont} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
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

                <div className="toolbar-group">
                    <button 
                        className={`toolbar-button dropdown-button rainbow-border-button ${activePopup === 'backgroundColor' ? 'active' : ''}`}
                        onClick={() => togglePopup('backgroundColor')}
                    >
                        <FontAwesomeIcon icon={faPen} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </button>
                    {activePopup === 'backgroundColor' && (
                        <div className="toolbar-popup">
                            <ColorGroup 
                                onColorChange={(color) => {
                                    onBackgroundColorChange(color);
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
                    onCheckList={onCheckList}
                />

                <div className="toolbar-group">
                    <button 
                        className={`toolbar-button dropdown-button ${activePopup === 'alignment' ? 'active' : ''}`}
                        onClick={() => togglePopup('alignment')}
                    >
                        <FontAwesomeIcon icon={faAlignLeft} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
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

                <div className="toolbar-group">
                    <button 
                        className={`toolbar-button dropdown-button ${activePopup === 'widgets' ? 'active' : ''}`}
                        onClick={() => togglePopup('widgets')}
                    >
                        <FontAwesomeIcon icon={faSitemap} />
                        <FontAwesomeIcon icon={faChevronDown} className="dropdown-icon" />
                    </button>
                    {activePopup === 'widgets' && (
                        <div className="toolbar-popup">
                            <WidgetSelector 
                                onWidgetInsert={handleWidgetInsert}
                                setActivePopup={setActivePopup}
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