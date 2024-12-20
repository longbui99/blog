import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaImage } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import DOMPurify from 'dompurify';
import '../styles/HtmlComposer.css';
import { COLOR_PALETTE } from '../const/colors';
import { FaArrowsLeftRight } from 'react-icons/fa6';
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

// New Image Component
const ImageComponent = ({ src, alt, initialWidth, onDelete, handleContentChange }) => {
    const [isResizing, setIsResizing] = useState(false);
    const [width, setWidth] = useState(initialWidth || "1120px");
    const imageRef = useRef(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = imageRef.current.offsetWidth;
    };

    const handleMouseMove = useCallback((e) => {
        if (!isResizing) return;
        
        const delta = e.clientX - startXRef.current;
        if (Math.abs(delta) > 5) { // Only resize if movement is more than 5px
            const newWidth = Math.min(Math.max(200, startWidthRef.current + delta), 1120);
            setWidth(`${newWidth}px`);
        }
    }, [isResizing]);

    const handleMouseUp = (e) => {
        setIsResizing(false);   
        handleContentChange();
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove]);

    const handleClick = (e) => {
        // Only delete if we weren't resizing
        if (!isResizing && imageRef.current.offsetWidth === startWidthRef.current) {
            onDelete(e);
        }
    };

    return (
        <img
            ref={imageRef}
            src={src}
            alt={alt}
            className="resizable-image"
            style={{ 
                width, 
                height: 'auto', 
                cursor: isResizing ? 'ew-resize' : 'pointer',
                position: 'relative',
                display: 'inline-block'
            }}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
        />
    );
};

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
    const urlInputRef = useRef(null); // Create a ref for the URL input

    useEffect(() => {
        if (location.pathname === '/new-page') {
            initialContent = '';
        }
        if (editorRef.current && initialContent) {
            const sanitizedContent = DOMPurify.sanitize(initialContent);
            editorRef.current.innerHTML = sanitizedContent;

            renderImages();
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

    const saveCurrentSelection = () => {
        const selectionInfo = getEditorSelection();
        if (!selectionInfo) return;
        
        setCurrentSelection(selectionInfo.range.cloneRange());
    }

    const handleKeyDown = (e) => {
        if (!isEditing) return;

        // Handle heading shortcuts
        const isModifierKey = isMac ? e.metaKey : e.ctrlKey;
        const isSecondModifier = isMac ? e.shiftKey : e.altKey;
        // In handleKeyDown function
        if (e.key === 'Tab') {
            const {selection, range, parentElement, isCodeBlock} = getSelectionInfo();
            if (!selection.rangeCount) return;
            if (isCodeBlock) {
                e.preventDefault();
                e.stopPropagation();
                const textNode = document.createTextNode('    ');
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                handleContentChange(); // Update content if needed
                return;
            }
            handleContentChange();
            return;
        }
        // Check for Enter key
        if (e.key === 'Enter') {
            // e.preventDefault(); // Prevent default behavior (like adding a new line)

            const {selection, range, parentElement, isCodeBlock} = getSelectionInfo();
            if (!selection.rangeCount) return;
            if (isCodeBlock) {
                e.preventDefault();
                e.stopPropagation();
                const textNode = document.createTextNode('\n');
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                handleContentChange(); // Update content if needed
                return;
            }

            let currentNode = range.startContainer;
            
            // If we're in a text node, get its parent
            if (currentNode?.tagName?.toLowerCase() === "div") {
                setTimeout(()=>{
                    replaceCurrentLineWithElement(`p`);
                }, 0)
            }
        }

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
            saveCurrentSelection()
            setShowSlashMenu(true);
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

        // Check for Command + Shift + 0 (Mac) or Control + Shift + 0 (Windows)
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === '0') {
            e.preventDefault(); // Prevent the default action
            document.execCommand('formatBlock', false, 'p'); // Format the selected text as a paragraph
        }
    };

    const handleSlashMenuInput = (e) => {
        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                const filteredCommands = SLASH_COMMANDS.filter(cmd => 
                    cmd.command.toLowerCase().includes(commandFilter.toLowerCase()) || cmd.label.toLowerCase().includes(commandFilter.toLowerCase())
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
                e.preventDefault();
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
            const selectionInfo = getEditorSelection();
        if (commandFilter.length > 0 && selectionInfo) {
            if (!selectionInfo) return;
            var { range, rect } = selectionInfo;
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
            // const startOffset = Math.max(0, range.startOffset - (commandFilter.length));
            // range.setStart(range.startContainer, startOffset);
            // range.setEnd(range.startContainer, range.startOffset + (commandFilter.length));
            
            // // Remove the slash and command text
            // range.deleteContents();
            
            // Get content without the slash
            const content = range.toString().slice(1);
            
            let newElement;
            switch (commandItem.command) {
                case 'h1':
                    document.execCommand('formatBlock', false, 'h1');
                    break;
                case 'h2':
                    document.execCommand('formatBlock', false, 'h2');
                    break;
                case 'h3':
                    document.execCommand('formatBlock', false, 'h3');
                    break;
                case 'h4':
                    document.execCommand('formatBlock', false, 'h4');
                    break;
                case 'h5':
                    document.execCommand('formatBlock', false, 'h5');
                    break;
                case 'h6':
                    document.execCommand('formatBlock', false, 'h6');
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

    const getSelectedContent = () => {
        const selection = window.getSelection(); // Get the current selection
        if (selection.rangeCount > 0) { // Check if there is a selection
            const range = selection.getRangeAt(0); // Get the first range
            const selectedContent = range.cloneContents(); // Clone the contents of the range
    
            // Convert the cloned contents to a string
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(selectedContent);
            const contentString = tempDiv.innerHTML; // Get the HTML string of the selected content
    
            console.log(contentString); // Output the selected content
            return contentString; // Return the selected content as a string
        }
        return ''; // Return an empty string if no selection
    };

    const closeSlashMenu = () => {
        setShowSlashMenu(false);
        setSelectedCommandIndex(0);
    };

    const handlePaste = (e) => {
        if (!isEditing) return;
        e.preventDefault();

        const {selection, range, parentElement, isCodeBlock} = getSelectionInfo();
        if (!selection) return;

        if (isCodeBlock) {
            const text = e.clipboardData.getData('text/plain');
            if (isCodeBlock) {
                e.preventDefault();
                e.stopPropagation();
                const textNode = document.createTextNode(text);
                range.insertNode(textNode);
                range.setStartAfter(textNode);
                range.setEndAfter(textNode);
                handleContentChange(); // Update content if needed
                return;
            }
            handleContentChange();
            return;
        }

        // Rest of your paste handler...
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (event) => {
                    const imgElement = {
                        src: event.target.result, // Base64 string
                        alt: 'Pasted Image' // Default alt text
                    };

                    // Create a new div to hold the ImageComponent
                    const newImageContainer = document.createElement('div');
                    newImageContainer.className = 'image-container';

                    // Create a React element for ImageComponent
                    const imageComponent = (
                        <ImageComponent 
                            src={imgElement.src} 
                            alt={imgElement.alt} 
                            onDelete={() => newImageContainer.remove()} 
                            handleContentChange={handleContentChange}
                        />
                    );

                    // Create a root for the new image container
                    const root = createRoot(newImageContainer);
                    root.render(imageComponent); // Render the ImageComponent into the new div

                    // Insert the new image container into the document
                    const selection = window.getSelection();
                    if (!selection.rangeCount) return;

                    const range = selection.getRangeAt(0);
                    range.deleteContents(); // Remove any selected content
                    range.insertNode(newImageContainer); // Insert the image container
                    handleContentChange(); // Update content
                };
                reader.readAsDataURL(file); // Convert image to Base64
                return; // Exit after handling the image
            }
        }

        // Fallback to plain text paste
        const text = e.clipboardData.getData('text/plain');
        const selectedContent = getSelectedContent(); // Get the currently selected content

        // Check if the pasted text is a valid image URL
        const imageUrlPattern = /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i; // Regex to match image file extensions
        if (imageUrlPattern.test(text)) {
            // If it's a direct image link, insert it as an image
            const imgElement = {
                src: text,
                alt: 'Pasted Image'
            };

            // Create a new div to hold the ImageComponent
            const newImageContainer = document.createElement('div');
            newImageContainer.className = 'image-container';

            // Create a React element for ImageComponent
            const imageComponent = (
                <ImageComponent 
                    src={imgElement.src} 
                    alt={imgElement.alt} 
                    onDelete={() => newImageContainer.remove()} 
                    handleContentChange={handleContentChange}
                />
            );

            // Create a root for the new image container
            const root = createRoot(newImageContainer);
            root.render(imageComponent); // Render the ImageComponent into the new div

            // Insert the new image container into the document
            const selection = window.getSelection();
            if (!selection.rangeCount) return;

            const range = selection.getRangeAt(0);
            range.deleteContents(); // Remove any selected content
            range.insertNode(newImageContainer); // Insert the image container
            handleContentChange(); // Update content
            return; // Exit after handling the image
        }

        // Check if the pasted text is a valid URL
        const urlPattern = /^(https?:\/\/[^\s]+)$/; // Basic regex for URL validation
        if (selectedContent) {
            const range = selection.getRangeAt(0);
            if (urlPattern.test(text)) {
                // If the pasted text is a valid URL, create a new anchor element
                const linkElement = document.createElement('a'); // Create a new anchor element
                linkElement.href = text; // Set the href to the pasted URL
                linkElement.innerText = selectedContent; // Set the link text to the pasted URL

                // Insert the link element at the current cursor position
                range.deleteContents(); // Remove any selected content
                range.insertNode(linkElement); // Insert the link element
                handleContentChange(); // Update content
                return; // Exit after inserting the link
            }
        }

        // If no text is selected or the pasted text is not a valid URL, show the link input popup
        if (!selection.rangeCount || urlPattern.test(text)) {
            saveCurrentSelection()
            setShowLinkInput(true); // Show the link input popup
            setLinkUrl(text); // Set the pasted text as the URL in the link input
        } else {
            // If the pasted content is plain text, create a <p> element and set its innerHTML
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = text; // Set the innerHTML to the pasted text

            // Insert the new paragraph into the document
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents(); // Remove any selected content
                range.insertNode(newParagraph); // Insert the new paragraph
                handleContentChange(); // Update content
            }
        }
    };

    // Filter commands based on input
    const filteredCommands = SLASH_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(commandFilter.toLowerCase()) || cmd.label.toLowerCase().includes(commandFilter.toLowerCase())
    );

    const handleCommandClick = (command) => {
        executeCommand(command.command);
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
        const imgElement = {
            src: imageUrl,
            alt: imageAlt
        };
        range.deleteContents(); // Remove any selected content

        // Create a new div to hold the ImageComponent
        const newImageContainer = document.createElement('div');
        newImageContainer.className = 'image-container';

        // Create a React element for ImageComponent
        const imageComponent = (
            <ImageComponent 
                src={imgElement.src} 
                alt={imgElement.alt} 
                onDelete={() => newImageContainer.remove()} 
                handleContentChange={handleContentChange}
            />
        );

        // Create a root for the new image container
        const root = createRoot(newImageContainer);
        root.render(imageComponent); // Render the ImageComponent into the new div

        // Insert the new image container into the document
        range.insertNode(newImageContainer);
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

    // In the return statement of HTMLComposer, render the images
    const renderImages = () => {
        const images = editorRef.current.querySelectorAll('img'); // Select all <img> elements
        images.forEach((img) => {
            const imgElement = {
                src: img.src,
                alt: img.alt || 'Image', // Default alt text if not provided
            };

            // Create a new div to hold the ImageComponent
            const newImageContainer = document.createElement('div');
            newImageContainer.className = 'image-container';

            // Create a React element for ImageComponent
            const imageComponent = (
                <ImageComponent 
                    src={imgElement.src} 
                    alt={imgElement.alt}
                    initialWidth={img.style.width}
                    onDelete={() => newImageContainer.remove()} // Handle deletion
                    handleContentChange={handleContentChange} // Trigger content change
                />
            );

            // Create a root for the new image container
            const root = createRoot(newImageContainer);
            root.render(imageComponent); // Render the ImageComponent into the new div

            // Replace the <img> element with the new image container
            img.parentNode.replaceChild(newImageContainer, img);
        });
    };

    // Effect to focus on the URL input when the link input is shown
    useEffect(() => {
        if (showLinkInput && urlInputRef.current) {
            urlInputRef.current.focus(); // Set focus on the URL input
        }
    }, [showLinkInput]); // Run effect when showLinkInput changes

    const handleCopy = (e) => {
        e.preventDefault(); // Prevent the default copy behavior

        const selection = window.getSelection(); // Get the current selection
        if (selection.rangeCount > 0) { // Check if there is a selection
            const range = selection.getRangeAt(0); // Get the first range
            const selectedContent = range.cloneContents(); // Clone the contents of the range

            // Create a temporary div to hold the cloned contents
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(selectedContent); // Append the cloned contents to the temp div

            // Get the HTML string of the selected content
            const contentString = tempDiv.innerHTML;

            // Use the Clipboard API to copy the HTML string to the clipboard
            navigator.clipboard.writeText(contentString).then(() => {
                console.log('Copied to clipboard:', contentString); // Optional: log the copied content
            }).catch(err => {
                console.error('Failed to copy: ', err); // Handle any errors
            });
        }
    };

    const getSelectionInfo = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return null;
        
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        return {
            selection,
            range,
            parentElement,
            isCodeBlock: parentElement.tagName === 'CODE' || 
                         parentElement.tagName === 'PRE' || 
                         parentElement.closest('code') || 
                         parentElement.closest('pre')
        };
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
                onCopy={handleCopy}
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
                            ref={urlInputRef} // Attach the ref to the input
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
