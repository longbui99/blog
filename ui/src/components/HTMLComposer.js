import React, { useState, useRef,useEffect } from 'react';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage } from 'react-icons/fa';
import DOMPurify from 'dompurify';
import '../styles/HtmlComposer.css';
import { COLOR_PALETTE } from '../const/colors';

// Color Picker Component
const ColorPicker = ({ colors, onSelectColor }) => {
    return (
        <div className="color-picker">
            {Object.entries(colors).map(([category, colorList]) => (
                <div key={category} className="color-category">
                    <div className="category-label">{category}</div>
                    <div className="color-grid">
                        {colorList.map((color) => (
                            <button
                                key={color.id}
                                className="color-option"
                                style={{ backgroundColor: color.value }}
                                onClick={() => onSelectColor(color)}
                                title={color.label}
                            >
                                <span className="color-label">{color.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Alignment Picker Component
const AlignmentPicker = ({ onSelectAlignment }) => {
    return (
        <div className="alignment-picker">
            <button 
                className="alignment-option" 
                onClick={() => onSelectAlignment('left')}
                title="Align Left"
            >
                <FaAlignLeft />
            </button>
            <button 
                className="alignment-option" 
                onClick={() => onSelectAlignment('center')}
                title="Align Center"
            >
                <FaAlignCenter />
            </button>
            <button 
                className="alignment-option" 
                onClick={() => onSelectAlignment('right')}
                title="Align Right"
            >
                <FaAlignRight />
            </button>
        </div>
    );
};

const SLASH_COMMANDS = [
    { id: 'h1', label: 'Heading 1', icon: 'H1', command: 'h1' },
    { id: 'h2', label: 'Heading 2', icon: 'H2', command: 'h2' },
    { id: 'h3', label: 'Heading 3', icon: 'H3', command: 'h3' },
    { id: 'h4', label: 'Heading 4', icon: 'H4', command: 'h4' },
    { id: 'h5', label: 'Heading 5', icon: 'H5', command: 'h5' },
    { 
        id: 'color',
        label: 'Text Color',
        icon: '🎨',
        command: 'color',
        showColorPicker: true,
        colors: COLOR_PALETTE
    },
    { 
        id: 'code-inline', 
        label: 'Inline Code', 
        icon: '`', 
        command: 'code-inline' 
    },
    { 
        id: 'code-block', 
        label: 'Code Block', 
        icon: '```', 
        command: 'code-block' 
    },
    { 
        id: 'align',
        label: 'Align Text',
        icon: <FaAlignLeft />,
        command: 'align',
        showAlignmentPicker: true
    },
    {
        id: 'link',
        label: 'Insert Link',
        icon: <FaLink />,
        command: 'link',
        showLinkInput: true
    },
    {
        id: 'image',
        label: 'Insert Image',
        icon: <FaImage />,
        command: 'image',
        showImageInput: true
    },
];

const HTMLComposer = ({ initialContent, onChange, isEditing }) => {
    const editorRef = useRef(null);
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [commandFilter, setCommandFilter] = useState('');
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [showAlignmentPicker, setShowAlignmentPicker] = useState(false);

    useEffect(() => {
        if (editorRef.current && initialContent) {
            const sanitizedContent = DOMPurify.sanitize(initialContent);
            editorRef.current.innerHTML = sanitizedContent;
        }
    }, [initialContent]);

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            const sanitizedContent = DOMPurify.sanitize(newContent);
            onChange(sanitizedContent);
        }
    };

    const getEditorSelection = () => {
        if (!editorRef.current) return null;
        
        const selection = document.getSelection();
        if (!selection.rangeCount) return null;

        const range = selection.getRangeAt(0);
        if (!editorRef.current.contains(range.commonAncestorContainer)) return null;

        // Create a temporary span to get the position
        const span = document.createElement('span');
        span.textContent = '\u200B'; // Zero-width space
        
        // Insert the span at the cursor position
        range.insertNode(span);
        
        // Get the position of the span
        const rect = span.getBoundingClientRect();
        
        // Remove the span
        span.parentNode.removeChild(span);
        
        // Restore the selection
        selection.removeAllRanges();
        selection.addRange(range);

        return {
            range: range.cloneRange(),
            rect
        };
    };

    const handleKeyDown = (e) => {
        if (!isEditing) return;

        if (e.key === '/') {
            e.preventDefault();
            const selectionInfo = getEditorSelection();
            if (!selectionInfo) return;
            
            setShowSlashMenu(true);
            setCurrentSelection(selectionInfo.range.cloneRange());
            setCommandFilter('');
            return;
        }

        if (e.key === 'Escape') {
            setShowLinkInput(false);
            setShowImageInput(false);
            setShowSlashMenu(false);
            return;
        }

        if (showSlashMenu) {
            handleSlashMenuInput(e);
        }
    };

    const handleSlashMenuInput = (e) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                const filteredCommands = SLASH_COMMANDS.filter(cmd => 
                    cmd.command.toLowerCase().includes(commandFilter.toLowerCase())
                );
                if (filteredCommands.length > 0) {
                    if (filteredCommands[selectedCommandIndex].showColorPicker) {
                        // If this command should show color picker, show it instead of executing immediately
                        setShowColorPicker(true);
                    } else {
                        executeCommand(filteredCommands[selectedCommandIndex]);
                    }
                }
                break;
            case 'Escape':
                closeSlashMenu();
                break;
            case 'Backspace':
                if (commandFilter.length === 0) {
                    closeSlashMenu();
                } else {
                    setCommandFilter(prev => prev.slice(0, -1));
                }
                break;
            default:
                // Only handle alphanumeric input
                if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
                    setCommandFilter(prev => prev + e.key);
                }
                break;
        }
    };

    const handleAlign = (alignment) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        if (!editorRef.current.contains(range.commonAncestorContainer)) return;

        try {
            switch (alignment) {
                case 'left':
                    document.execCommand('justifyLeft', false, null);
                    break;
                case 'center':
                    document.execCommand('justifyCenter', false, null);
                    break;
                case 'right':
                    document.execCommand('justifyRight', false, null);
                    break;
                default:
                    break;
            }
            handleInput(); // Trigger content update
        } catch (error) {
            console.error('Error aligning text:', error);
        }
    };

    const executeCommand = (commandItem) => {
        // Clone the current selection to avoid modifying the actual cursor
        if (commandFilter.length > 0) {
            const selectionInfo = getEditorSelection();
            var { range, rect } = selectionInfo;
            if (!selectionInfo) return;
        } else {
            if (!currentSelection) return;
            var range = currentSelection.cloneRange();
        }

        // Only close slash menu for non-picker commands
        if (!commandItem.showColorPicker && !commandItem.showAlignmentPicker) {
            closeSlashMenu();
        }
        
        try {
            // Move selection one character back to include the slash and command text
            const startOffset = Math.max(0, range.startOffset - (commandFilter.length));
            range.setStart(range.startContainer, startOffset);
            range.setEnd(range.startContainer, range.startOffset + (commandFilter.length));
            
            // Remove the slash and command text
            range.deleteContents();
            
            // Get content without the slash
            const content = range.toString().slice(1);
            
            let newElement;
            switch (commandItem.command) {
                case 'h1':
                case 'h2':
                case 'h3':
                case 'h4':
                case 'h5':
                    newElement = document.createElement(commandItem.command);
                    newElement.textContent = content || '\u200B';
                    break;
                case 'pre':
                    newElement = document.createElement('pre');
                    const code = document.createElement('code');
                    code.textContent = content || '\u200B';
                    newElement.appendChild(code);
                    break;
                case 'color':
                    newElement = document.createElement('span');
                    newElement.style.color = commandItem.color.value;
                    newElement.textContent = content || '\u200B';
                    break;
                case 'code-inline':
                    newElement = document.createElement('code');
                    newElement.className = 'inline-code';
                    newElement.textContent = content || '\u200B';
                    break;
                case 'code-block':
                    newElement = document.createElement('pre');
                    const codeElement = document.createElement('code');
                    codeElement.className = 'language-javascript'; // Default to JavaScript
                    codeElement.textContent = content || '\u200B';
                    newElement.appendChild(codeElement);
                    
                    // Add copy button container
                    const wrapper = document.createElement('div');
                    wrapper.className = 'code-block-wrapper';
                    
                    // Add copy button
                    const copyButton = document.createElement('button');
                    copyButton.className = 'copy-button';
                    copyButton.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>';
                    
                    wrapper.appendChild(copyButton);
                    wrapper.appendChild(newElement);
                    newElement = wrapper;
                    break;
                case 'align':
                    if (commandItem.showAlignmentPicker) {
                        setShowAlignmentPicker(true);
                    } else if (commandItem.alignment) {
                        handleAlign(commandItem.alignment);
                        setShowAlignmentPicker(false);
                        setShowSlashMenu(false);
                    }
                    break;
                case 'link':
                    if (commandItem.showLinkInput) {
                        setShowLinkInput(true);
                        setShowSlashMenu(false);
                    }
                    break;
                case 'image':
                    if (commandItem.showImageInput) {
                        setShowImageInput(true);
                        setShowSlashMenu(false);
                    }
                    break;
                default:
                    break;
            }

            if (newElement) {
                // Insert the new element
                range.insertNode(newElement);

                // Create a new range for cursor positioning
                const newRange = document.createRange();
                
                // Position cursor at the end of the new element
                newRange.setStart(newElement.firstChild || newElement, content ? content.length : 1);
                newRange.collapse(true);

                // Update selection
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(newRange);

            }
        } catch (error) {
            console.error('Range error:', error);
            range.collapse(true);
        }

        // Reset the command filter
        setCommandFilter('');
    };

    const closeSlashMenu = () => {
        setShowSlashMenu(false);
        setSelectedCommandIndex(0);
    };

    const handlePaste = (e) => {
        if (!isEditing) return;
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    // Filter commands based on input
    const filteredCommands = SLASH_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(commandFilter.toLowerCase()) || cmd.label.toLowerCase().includes(commandFilter.toLowerCase())
    );

    const handleCommandClick = (command) => {
        if (command.showColorPicker) {
            setShowColorPicker(true);
        } else if (command.showAlignmentPicker) {
            setShowAlignmentPicker(true);
        } else {
            executeCommand(command);
        }
    };

    const handleContentChange = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleLinkSubmit = (e) => {
        e.preventDefault();
        if (!currentSelection) return;
        
        const range = currentSelection.cloneRange();
        const linkElement = document.createElement('a');
        linkElement.href = linkUrl;
        linkElement.target = '_blank';
        linkElement.textContent = linkText || linkUrl;
        range.deleteContents();
        range.insertNode(linkElement);
        setShowLinkInput(false);
        setLinkUrl('');
        setLinkText('');
        handleContentChange();
    };

    const handleImageSubmit = (e) => {
        e.preventDefault();
        if (!currentSelection) return;
        
        const range = currentSelection.cloneRange();
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = imageAlt;
        imgElement.style.maxWidth = '100%';
        range.deleteContents();
        range.insertNode(imgElement);
        setShowImageInput(false);
        setImageUrl('');
        setImageAlt('');
        handleContentChange();
    };

    return (
        <div className="html-composer">
            <div
                ref={editorRef}
                className="editor-content"
                contentEditable={isEditing}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
            />
            
            {showSlashMenu && (
                <div 
                    className="slash-menu"
                >
                    <div className="command-input">
                        /{commandFilter}
                    </div>
                    <div className="slash-menu-items">
                        {filteredCommands.map((command, index) => (
                            <div
                                key={command.id}
                                className={`slash-menu-item ${index === selectedCommandIndex ? 'selected' : ''}`}
                                onClick={() => handleCommandClick(command)}
                            >
                                <span className="slash-menu-icon">{command.icon}</span>
                                <span className="slash-menu-label">{command.label}</span>
                            </div>
                        ))}
                    </div>
                    
                    {showColorPicker && (
                        <ColorPicker
                            colors={SLASH_COMMANDS.find(cmd => cmd.id === 'color').colors}
                            onSelectColor={(color) => {
                                executeCommand({
                                    command: 'color',
                                    color: color
                                });
                                setShowColorPicker(false);
                            }}
                        />
                    )}

                    {showAlignmentPicker && (
                        <AlignmentPicker
                            onSelectAlignment={(alignment) => {
                                executeCommand({
                                    command: 'align',
                                    alignment: alignment
                                });
                                setShowAlignmentPicker(false);
                                setShowSlashMenu(false);
                            }}
                        />
                    )}
                </div>
            )}

            {showLinkInput && (
                <div className="popup-overlay">
                    <form className="popup-form" onSubmit={handleLinkSubmit}>
                        <input
                            type="url"
                            placeholder="Enter URL"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Link text (optional)"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                        />
                        <div className="popup-buttons">
                            <button type="submit">Insert</button>
                            <button type="button" onClick={() => setShowLinkInput(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}

            {showImageInput && (
                <div className="popup-overlay">
                    <form className="popup-form" onSubmit={handleImageSubmit}>
                        <input
                            type="url"
                            placeholder="Enter image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Alt text (optional)"
                            value={imageAlt}
                            onChange={(e) => setImageAlt(e.target.value)}
                        />
                        <div className="popup-buttons">
                            <button type="submit">Insert</button>
                            <button type="button" onClick={() => setShowImageInput(false)}>Cancel</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default HTMLComposer;
