import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import '../styles/HtmlComposer.css';

const SLASH_COMMANDS = [
    { id: 'h1', label: 'Heading 1', icon: 'H1', command: 'h1' },
    { id: 'h2', label: 'Heading 2', icon: 'H2', command: 'h2' },
    { id: 'h3', label: 'Heading 3', icon: 'H3', command: 'h3' },
    { id: 'h4', label: 'Heading 4', icon: 'H4', command: 'h4' },
    { id: 'h5', label: 'Heading 5', icon: 'H5', command: 'h5' },
    { id: 'code', label: 'Code Block', icon: '⌨️', command: 'pre' },
    { id: 'red', label: 'Red Text', icon: '🔴', command: 'color-red' },
    { id: 'blue', label: 'Blue Text', icon: '🔵', command: 'color-blue' },
    { id: 'green', label: 'Green Text', icon: '🟢', command: 'color-green' },
];

const HTMLComposer = ({ initialContent, onChange, isEditing }) => {
    const editorRef = useRef(null);
    const [rawHtml, setRawHtml] = useState('');
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ x: 0, y: 0 });
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [commandFilter, setCommandFilter] = useState('');

    useEffect(() => {
        if (editorRef.current && initialContent) {
            const sanitizedContent = DOMPurify.sanitize(initialContent);
            editorRef.current.innerHTML = sanitizedContent;
            setRawHtml(sanitizedContent);
        }
    }, [initialContent]);

    const handleInput = () => {
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            const sanitizedContent = DOMPurify.sanitize(newContent);
            setRawHtml(sanitizedContent);
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
            const base_rect = editorRef.current.getBoundingClientRect();
            const { range, rect } = selectionInfo;
            
            setShowSlashMenu(true);
            setSlashMenuPosition({
                x: Math.max(0, Math.max(rect.x, base_rect.x) - base_rect.x),
                y: Math.max(0, Math.max(rect.y, base_rect.y) - 4*rect.height + window.scrollY - base_rect.y)
            });
            setCurrentSelection(selectionInfo.range.cloneRange());
            setCommandFilter('');
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
                    executeCommand(filteredCommands[selectedCommandIndex]);
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
                if (e.key.length === 1 && /[a-zA-Z0-9]/.test(e.key)) {
                    setCommandFilter(prev => prev + e.key);
                }
                break;
        }
    };

    const executeCommand = (commandItem) => {
        if (!currentSelection) return;

        closeSlashMenu();
        
        // Clone the current selection to avoid modifying the actual cursor
        const selectionInfo = getEditorSelection();
        const { range, rect } = selectionInfo;
        
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
                case 'color-red':
                case 'color-blue':
                case 'color-green':
                    newElement = document.createElement('span');
                    newElement.style.color = commandItem.command.split('-')[1];
                    newElement.textContent = content || '\u200B';
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

                handleInput();
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
        cmd.command.toLowerCase().includes(commandFilter.toLowerCase())
    );

    return (
        <div className="html-composer">
            <div
                ref={editorRef}
                className={`editor-content ${isEditing ? 'editable' : ''}`}
                contentEditable={isEditing}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
            />
            
            {showSlashMenu && (
                <div 
                    className="slash-menu"
                    style={{
                        position: 'absolute',
                        left: `${slashMenuPosition.x}px`,
                        top: `${slashMenuPosition.y}px`,
                    }}
                >
                    <div className="command-input">
                        /{commandFilter}
                    </div>
                    <div className="slash-menu-items">
                        {filteredCommands.map((command, index) => (
                            <div
                                key={command.id}
                                className={`slash-menu-item ${index === selectedCommandIndex ? 'selected' : ''}`}
                                onClick={() => executeCommand(command)}
                            >
                                <span className="slash-menu-icon">{command.icon}</span>
                                <span className="slash-menu-label">{command.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HTMLComposer;
