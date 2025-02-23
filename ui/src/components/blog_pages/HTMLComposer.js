import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import storageRegistry from '../../store/storage_registry';
import './styles/HTMLComposer.css';
import { isHTML, plainToHTML, insertContent } from './utils/PlainToHTML';

const HTMLComposer = () => {
    const editorRef = useRef(null);

    // Get state from Redux
    const isEditing = useSelector(state => state.editing.isEditing);
    const isCreating = useSelector(state => state.editing.isCreating);
    const blogContent = useSelector(state => state.blog.content);

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

    const handleInput = (e) => {
        
        if (editorRef.current) {
            const newContent = editorRef.current.innerHTML;
            const sanitizedContent = DOMPurify.sanitize(newContent);
            
            // Store content in registry
            storageRegistry.update('currentContent', sanitizedContent);
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        
        const text = e.clipboardData.getData('text/plain');
        const range = selection.getRangeAt(0);
        
        const updatedRange = insertContent(text, range);
        if (updatedRange) {
            selection.removeAllRanges();
            selection.addRange(updatedRange);
        }
        
        handleInput();
    };

    return (
        <div className="html-composer">
            <div
                ref={editorRef}
                className="editor-content"
                contentEditable={isEditing || isCreating}
                onInput={handleInput}
                onPaste={handlePaste}
                suppressContentEditableWarning={true}
            />
        </div>
    );
};

export default HTMLComposer;
