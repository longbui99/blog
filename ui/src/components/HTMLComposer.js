import React, { useState, useRef,useEffect } from 'react';
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
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

const KEYBOARD_SHORTCUTS = {
    '¡': {tag:"h1", mac: 'cmd+alt+1', windows: 'ctrl+alt+1' },
    '™': {tag:"h2", mac: 'cmd+alt+2', windows: 'ctrl+alt+2' },
    '£': {tag:"h3", mac: 'cmd+alt+3', windows: 'ctrl+alt+3' },
    '¢': {tag:"h4", mac: 'cmd+alt+4', windows: 'ctrl+alt+4' },
    '∞': {tag:"h5", mac: 'cmd+alt+5', windows: 'ctrl+alt+5' },
    'º': {tag:"p", mac: 'cmd+alt+0', windows: 'ctrl+alt+0' },
};

const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

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
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === '/new-page') {
            initialContent = '';
        }
        if (editorRef.current && initialContent) {
            const sanitizedContent = DOMPurify.sanitize(initialContent);
            editorRef.current.innerHTML = sanitizedContent;
        }
    }, [initialContent]);

    const handleInput = (e) => {
        if (!isEditing) return;

        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        // Only process if we're in a text node
        if (container.nodeType !== Node.TEXT_NODE) return;
        
        const text = container.textContent;
        
        // Check for unordered list
        if (text.trim() === '-') {
            e.preventDefault();
            const listItem = document.createElement('li');
            const list = document.createElement('ul');
            
            // Remove the dash
            container.textContent = '';
            
            // Create and insert the list
            listItem.appendChild(document.createElement('br'));
            list.appendChild(listItem);
            range.insertNode(list);
            
            // Position cursor in list item
            const newRange = document.createRange();
            newRange.setStart(listItem, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            handleContentChange();
            return;
        }
        
        // Check for ordered list
        const orderedListMatch = text.match(/^(\d+)\.\s*$/);
        if (orderedListMatch) {
            e.preventDefault();
            const listItem = document.createElement('li');
            const list = document.createElement('ol');
            
            // Remove the number and dot
            container.textContent = '';
            
            // Create and insert the list
            listItem.appendChild(document.createElement('br'));
            list.appendChild(listItem);
            range.insertNode(list);
            
            // Position cursor in list item
            const newRange = document.createRange();
            newRange.setStart(listItem, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            handleContentChange();
            return;
        }

        // Call the original handleInput logic
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

        // Handle heading shortcuts
        const isModifierKey = isMac ? e.metaKey : e.ctrlKey;
        const isSecondModifier = isMac ? e.shiftKey : e.altKey;

        if (isModifierKey && isSecondModifier && /[1-5]/.test(e.key)) {
            e.preventDefault();
            e.stopPropagation();
            replaceCurrentLineWithElement(`h${e.key}`);
            return;
        }
        if (isModifierKey && e.altKey && KEYBOARD_SHORTCUTS[e.key]?.tag) {
            const shortcutKey = e.key;
            const shortcut = KEYBOARD_SHORTCUTS[shortcutKey];
            
            if (shortcut) {
                const tag = shortcut.tag;
                console.log('Executing shortcut:', tag);
                e.preventDefault();
                
                const selection = window.getSelection();
                if (!selection.rangeCount) return;

                const range = selection.getRangeAt(0);
                const headingElement = document.createElement(tag);
                
                range.deleteContents();
                range.insertNode(headingElement);
                
                return;
            }
        }

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
                    replaceCurrentLineWithElement(commandItem.command);
                    closeSlashMenu();
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

        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgElement = document.createElement('img');
                    imgElement.src = event.target.result; // Base64 string
                    imgElement.style.maxWidth = '100%'; // Optional styling
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;

                    const range = selection.getRangeAt(0);
                    range.deleteContents(); // Remove any selected content
                    range.insertNode(imgElement); // Insert the image
                    handleContentChange(); // Update content
                };
                reader.readAsDataURL(file); // Convert image to Base64
                return; // Exit after handling the image
            }
        }

        // Fallback to plain text paste
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

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener('keydown', handleKeyDown);
            return () => {
                editor.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isEditing]); // Add dependencies as needed

    // Add this function inside your HTMLComposer component
    const replaceCurrentLineWithElement = (tagName) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        let currentNode = range.startContainer;
        
        // If we're in a text node, get its parent
        if (currentNode.nodeType === Node.TEXT_NODE) {
            currentNode = currentNode.parentNode;
        }

        // Find the current block-level element
        while (currentNode && currentNode !== editorRef.current && 
               !/^(p|h[1-5]|div)$/i.test(currentNode.nodeName)) {
            currentNode = currentNode.parentNode;
        }

        if (!currentNode || currentNode === editorRef.current) {
            // If no block element found, wrap current selection in new element
            const newElement = document.createElement(tagName);
            range.surroundContents(newElement);
        } else {
            // Replace the current block element
            const newElement = document.createElement(tagName);
            newElement.innerHTML = currentNode.innerHTML;
            currentNode.parentNode.replaceChild(newElement, currentNode);
            
            // Set cursor to end of new element
            const newRange = document.createRange();
            newRange.selectNodeContents(newElement);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
        }

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
