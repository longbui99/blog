import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import storageRegistry from '../../store/storage_registry';
import './styles/HTMLComposer.css';
import { isHTML, insertContent, isImage, isLink } from './utils/PlainToHTML';
import EditorToolbar from './components/toolbar/EditorToolbar';
import InsertionPopup from './components/InsertionPopup';

const HTMLComposer = () => {
    const editorRef = useRef(null);
    const toolbarRef = useRef(null);
    const [showPopup, setShowPopup] = useState(null); // 'link' or 'image' or null
    const [savedRange, setSavedRange] = useState(null);

    // Get state from Redux
    const isEditing = useSelector(state => state.editing.isEditing);
    const isCreating = useSelector(state => state.editing.isCreating);
    const blogContent = useSelector(state => state.blog.content);

    const colors = [
        { color: 'var(--text-primary)', label: 'Default Text' },
        { color: 'var(--primary-500)', label: 'Primary Red' },
        { color: '#166534', label: 'Forest' },
        { color: '#1e3a8a', label: 'Navy' },
        { color: '#f59e0b', label: 'Amber' },
        { color: '#7c3aed', label: 'Violet' },
        { color: '#0ea5e9', label: 'Sky' },
        { color: 'var(--neutral-400)', label: 'Gray' },
        { color: '#881337', label: 'Wine' },
        { color: '#10b981', label: 'Emerald' }
    ];

    useEffect(() => {
        // Initialize editor content
        if (editorRef.current) {
            let content = '';
            
            if (isCreating) {
                content = ''; // Empty content for new posts
            } else if (isEditing && blogContent?.content) {
                content = blogContent.content; // Keep existing content when editing
            }

            const sanitizedContent = DOMPurify.sanitize(content);
            editorRef.current.innerHTML = sanitizedContent;
            
            // Store initial content in registry
            storageRegistry.update('currentContent', sanitizedContent);
        }
    }, [blogContent, isCreating, isEditing]);

    useEffect(() => {
        const editor = editorRef.current;
        if (editor) {
            editor.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            if (editor) {
                editor.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault(); // Prevent focus moving
            handleTab(e);
        }
    };

    const handleTab = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        
        // Get the closest li element - safely handling text nodes
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) { // Text node
            node = node.parentNode;
        }
        
        const listItem = node.closest('li');
        
        if (listItem) {
            if (e.shiftKey) {
                // Outdent on Shift+Tab
                document.execCommand('outdent', false, null);
            } else {
                // Indent on Tab
                document.execCommand('indent', false, null);
            }
            handleInput();
            return;
        }

        // Default tab behavior for non-list elements
        document.execCommand('insertText', false, '\t');
        handleInput();
    };

    const handleInput = (e) => {
        // Regular content handling
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            const sanitizedContent = DOMPurify.sanitize(newContent);
            
            // Store content in registry
            storageRegistry.update('currentContent', sanitizedContent);
        }
    };

    const handlePaste = async (e) => {
        e.preventDefault();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const items = Array.from(e.clipboardData.items);
        const imageItem = items.find(item => item.type.startsWith('image/'));
        var text = '';
        if (imageItem) {
            const blob = imageItem.getAsFile();
            const base64Url = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
            text = base64Url;
        }
        else {
            text = e.clipboardData.getData('text/plain');
        }

        const range = selection.getRangeAt(0);
        // Get the selected text for potential link display text

        if (isImage(text)) {
            // Handle image paste
            handleInsertionImage({
                url: text,
                text: 'Pasted image',
                range: range
            });
        } else if (isLink(text)) {
            const selectedText = range.toString();
            // Handle link paste
            handleInsertionLink({
                url: text,
                text: selectedText || text,
                range: range
            });
        } else if (isHTML(text)) {
            // Handle HTML paste (existing behavior)
            const updatedRange = insertContent(text, range);
            if (updatedRange) {
                selection.removeAllRanges();
                selection.addRange(updatedRange);
            }
        } else {
            // Handle plain text paste
            document.execCommand('insertText', false, text);
        }
        
        handleInput();
    };

    const handleColorChange = (color) => {
        const selection = window.getSelection();
        
        // Convert CSS variable to actual color value
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        document.body.appendChild(tempElement);
        const computedColor = window.getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);
        
        // Apply text color using execCommand (maintains undo stack)
        document.execCommand('foreColor', false, computedColor);
        
        // Restore focus
        editorRef.current?.focus();
        handleInput();
    };

    const handleBackgroundColorChange = (color) => {
        const selection = window.getSelection();
        
        // Convert CSS variable to actual color value
        const tempElement = document.createElement('div');
        tempElement.style.backgroundColor = color;
        document.body.appendChild(tempElement);
        const computedColor = window.getComputedStyle(tempElement).backgroundColor;
        document.body.removeChild(tempElement);
        
        // Apply background color using execCommand (maintains undo stack)
        document.execCommand('hiliteColor', false, computedColor);
        
        // Restore focus
        editorRef.current?.focus();
        handleInput();
    };

    const handleAlignment = (alignment) => {
        document.execCommand(alignment, false, null);
        editorRef.current?.focus();
    };

    const saveCurrentSelection = () => {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
        }
    };

    const restoreSelection = () => {
        if (savedRange) {
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(savedRange);
        }
    };

    const handleLink = () => {
        saveCurrentSelection();
        setShowPopup('link');
    };

    const handleImage = () => {
        saveCurrentSelection();
        setShowPopup('image');
    };

    const handleInlineCode = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const code = document.createElement('code');
        
        range.surroundContents(code);
        editorRef.current?.focus();
        handleInput();
    };

    const handleCodeBlock = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        
        // Preserve the selected content
        code.textContent = "1.\n2.\n3.";
        pre.appendChild(code);
        
        range.deleteContents();
        range.insertNode(pre);
        
        editorRef.current?.focus();
        handleInput();
    };

    const handleInsertionLink = ({ url, text, range }) => {
        // Store the next character after the range
        const nextNode = range.endContainer;
        const endOffset = range.endOffset;
        const hasSpaceAfter = nextNode.textContent?.[endOffset] === ' ';
        
        // Delete existing content if there's a selection
        range.deleteContents();
        
        // Insert the text that will become the link
        document.execCommand('insertText', false, text + (hasSpaceAfter ? ' ' : ''));
        
        // Get the range of the newly inserted text (excluding the space)
        const selection = window.getSelection();
        const newRange = document.createRange();
        newRange.setStart(selection.anchorNode, selection.anchorOffset - text.length - (hasSpaceAfter ? 1 : 0));
        newRange.setEnd(selection.anchorNode, selection.anchorOffset - (hasSpaceAfter ? 1 : 0));
        
        // Select the new text
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Create the link
        document.execCommand('createLink', false, url);
        return selection.anchorNode.parentElement;
    }

    const handleInsertionImage = ({ url, text, range }) => {
        // Delete existing content if there's a selection
        range.deleteContents();
        
        // Insert the image
        document.execCommand('insertImage', false, url);
        
        // Find and update the newly inserted image
        const selection = window.getSelection();
        const insertedImage = selection.anchorNode.querySelector('img[src="' + url + '"]');
        if (insertedImage) {
            insertedImage.alt = text;
        }
        return insertedImage;
    }

    const handleInsertionSubmit = ({ url, text }) => {
        restoreSelection();
        
        if (savedRange) {
            if (showPopup === 'link') {
                handleInsertionLink({ url, text , range: savedRange });
            } else if (showPopup === 'image') {
                handleInsertionImage({ url, text , range: savedRange });
            }
            setSavedRange(null);
            editorRef.current?.focus();
        }
    };

    const handleHeading = (tag) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        // Get the current block element
        let node = selection.anchorNode;
        while (node && node.nodeType !== 1) {
            node = node.parentNode;
        }

        // If we're already in a heading, remove it
        if (node && /^H[1-5]$/.test(node.tagName)) {
            const p = document.createElement('p');
            p.innerHTML = node.innerHTML;
            node.parentNode.replaceChild(p, node);
        } else {
            // Apply the heading
            document.execCommand('formatBlock', false, tag);
        }

        editorRef.current?.focus();
        handleInput();
    };

    const handleBulletList = () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        document.execCommand('insertUnorderedList', false, null);
        
        // Restore cursor position
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
    };

    const handleNumberList = () => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        
        document.execCommand('insertOrderedList', false, null);
        
        // Restore cursor position
        selection.removeAllRanges();
        selection.addRange(range);
        handleInput();
    };

    const handleTextStyle = (style) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        switch (style) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'strikeThrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'subscript':
                document.execCommand('subscript', false, null);
                break;
            case 'superscript':
                document.execCommand('superscript', false, null);
                break;
            case 'code':
                handleInlineCode();
                return; // handleInlineCode already handles focus and input
            case 'removeFormat':
                document.execCommand('removeFormat', false, null);
                break;
            default:
                break;
        }
        
        editorRef.current?.focus();
        handleInput();
    };

    const handleCheckList = () => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const range = selection.getRangeAt(0);
        let spanToFocus = null;
        
        // First, check if we're already in a list
        let node = range.commonAncestorContainer;
        if (node.nodeType === 3) { // Text node
            node = node.parentNode;
        }
        
        const existingList = node.closest('ul, ol');
        
        if (existingList) {
            // Convert existing list to checklist
            existingList.className = 'checklist';
            
            // Add checkboxes to each list item
            Array.from(existingList.querySelectorAll('li')).forEach((li, index) => {
                li.className = 'checklist-item';
                
                // Create checkbox if it doesn't exist
                if (!li.querySelector('.checklist-checkbox')) {
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'checklist-checkbox';
                    
                    // Wrap existing content in a span
                    const textContent = li.innerHTML;
                    li.innerHTML = '';
                    
                    const span = document.createElement('span');
                    span.className = 'checklist-text';
                    span.innerHTML = textContent;
                    
                    li.appendChild(checkbox);
                    li.appendChild(span);
                    
                    // Store the span of the current item for focus
                    if (index === 0) {
                        spanToFocus = span;
                    }
                    
                    // Add change event listener
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            span.style.textDecoration = 'line-through';
                            span.style.opacity = '0.7';
                        } else {
                            span.style.textDecoration = 'none';
                            span.style.opacity = '1';
                        }
                        handleInput();
                    });
                }
            });
        } else {
            // Create a new checklist
            // First try to use execCommand to create a list structure
            document.execCommand('insertUnorderedList', false, null);
            
            // Now find the newly created list
            const newSelection = window.getSelection();
            let listNode = newSelection.anchorNode;
            if (listNode.nodeType === 3) {
                listNode = listNode.parentNode;
            }
            
            const newList = listNode.closest('ul');
            
            if (newList) {
                // Convert to checklist
                newList.className = 'checklist';
                
                // Add checkboxes to each list item
                Array.from(newList.querySelectorAll('li')).forEach((li, index) => {
                    li.className = 'checklist-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'checklist-checkbox';
                    
                    // Wrap existing content in a span
                    const textContent = li.innerHTML;
                    li.innerHTML = '';
                    
                    const span = document.createElement('span');
                    span.className = 'checklist-text';
                    span.innerHTML = textContent;
                    
                    li.appendChild(checkbox);
                    li.appendChild(span);
                    
                    // Store the span of the current item for focus
                    if (index === 0) {
                        spanToFocus = span;
                    }
                    
                    // Add change event listener
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            span.style.textDecoration = 'line-through';
                            span.style.opacity = '0.7';
                        } else {
                            span.style.textDecoration = 'none';
                            span.style.opacity = '1';
                        }
                        handleInput();
                    });
                });
            } else {
                // Fallback to manual creation if execCommand didn't work
                const ul = document.createElement('ul');
                ul.className = 'checklist';
                
                // Create list items with checkboxes
                const items = ['', '', ''];  // Default 3 empty items
                
                items.forEach((item, index) => {
                    const li = document.createElement('li');
                    li.className = 'checklist-item';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.className = 'checklist-checkbox';
                    
                    const span = document.createElement('span');
                    span.className = 'checklist-text';
                    span.contentEditable = true;
                    span.textContent = item;
                    
                    li.appendChild(checkbox);
                    li.appendChild(span);
                    ul.appendChild(li);
                    
                    // Store the span of the first item for focus
                    if (index === 0) {
                        spanToFocus = span;
                    }
                    
                    // Add change event listener
                    checkbox.addEventListener('change', () => {
                        if (checkbox.checked) {
                            span.style.textDecoration = 'line-through';
                            span.style.opacity = '0.7';
                        } else {
                            span.style.textDecoration = 'none';
                            span.style.opacity = '1';
                        }
                        handleInput();
                    });
                });
                
                // Insert the checklist
                range.deleteContents();
                range.insertNode(ul);
            }
        }
        
        // Set focus on the first span element
        if (spanToFocus) {
            // Create a new range and set it to the beginning of the span
            const newRange = document.createRange();
            
            // If the span has text content, place cursor at the beginning
            if (spanToFocus.firstChild && spanToFocus.firstChild.nodeType === 3) {
                newRange.setStart(spanToFocus.firstChild, 0);
                newRange.setEnd(spanToFocus.firstChild, 0);
            } else {
                // If span is empty, just place cursor inside the span
                newRange.setStart(spanToFocus, 0);
                newRange.setEnd(spanToFocus, 0);
            }
            
            // Apply the new selection
            selection.removeAllRanges();
            selection.addRange(newRange);
            
            // Ensure the span gets focus
            spanToFocus.focus();
        }
        
        editorRef.current?.focus();
        handleInput();
    };

    return (
        <div className="html-composer">
            <EditorToolbar 
                ref={toolbarRef}
                onColorChange={handleColorChange}
                onBackgroundColorChange={handleBackgroundColorChange}
                onAlignment={handleAlignment}
                onLink={handleLink}
                onImage={handleImage}
                onInlineCode={handleInlineCode}
                onCodeBlock={handleCodeBlock}
                onHeading={handleHeading}
                onBulletList={handleBulletList}
                onNumberList={handleNumberList}
                onTextStyle={handleTextStyle}
                onCheckList={handleCheckList}
            />
            <div
                ref={editorRef}
                className="editor-content"
                contentEditable={isEditing || isCreating}
                onInput={handleInput}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
            />
            {showPopup && (
                <InsertionPopup
                    type={showPopup}
                    onSubmit={handleInsertionSubmit}
                    onClose={() => setShowPopup(null)}
                    initialText={showPopup === 'link' ? window.getSelection().toString() : ''}
                />
            )}
        </div>
    );
};

export default HTMLComposer;
