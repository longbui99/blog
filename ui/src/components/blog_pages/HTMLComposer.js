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
        const listItem = range.commonAncestorContainer.closest('li');
        
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
        const range = selection.getRangeAt(0);
        
        // Convert CSS variable to actual color value
        const tempElement = document.createElement('div');
        tempElement.style.color = color;
        document.body.appendChild(tempElement);
        const computedColor = window.getComputedStyle(tempElement).color;
        document.body.removeChild(tempElement);
        
        // Apply color using execCommand (maintains undo stack)
        document.execCommand('foreColor', false, computedColor);
        
        // Restore focus
        editorRef.current?.focus();
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

    return (
        <div className="html-composer">
            <EditorToolbar 
                ref={toolbarRef}
                onColorChange={handleColorChange}
                onAlignment={handleAlignment}
                onLink={handleLink}
                onImage={handleImage}
                onInlineCode={handleInlineCode}
                onCodeBlock={handleCodeBlock}
                onHeading={handleHeading}
                onBulletList={handleBulletList}
                onNumberList={handleNumberList}
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
