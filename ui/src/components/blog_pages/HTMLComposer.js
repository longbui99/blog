import React, { useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DOMPurify from 'dompurify';
import storageRegistry from '../../store/storage_registry';
import './styles/HTMLComposer.css';
import { isHTML, insertContent } from './utils/PlainToHTML';

const HTMLComposer = () => {
    const editorRef = useRef(null);
    const toolbarRef = useRef(null);

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
        const handleScroll = () => {
            if (!toolbarRef.current) return;
            
            const toolbarRect = toolbarRef.current.getBoundingClientRect();
            const isFixed = toolbarRect.top <= 0;
            
            if (isFixed) {
                toolbarRef.current.classList.add('fixed');
            } else {
                toolbarRef.current.classList.remove('fixed');
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
        if (isHTML(text)) {
            const updatedRange = insertContent(text, range);
            if (updatedRange) {
                selection.removeAllRanges();
                selection.addRange(updatedRange);
            }
        }
        
        handleInput();
    };

    const handleColorChange = (color) => {
        // Save current selection
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        // Apply color to selection
        document.execCommand('foreColor', false, color);

        // Restore selection
        selection.removeAllRanges();
        selection.addRange(range);
        
        // Ensure editor maintains focus
        editorRef.current?.focus();
    };

    const handleAlignment = (alignment) => {
        document.execCommand(alignment, false, null);
        editorRef.current?.focus();
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) {
            document.execCommand('createLink', false, url);
            editorRef.current?.focus();
        }
    };

    const handleImage = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            document.execCommand('insertImage', false, url);
            editorRef.current?.focus();
        }
    };

    return (
        <div className="html-composer">
            <div ref={toolbarRef} className="editor-toolbar">
                {/* Color Group */}
                <div className="toolbar-group color-group">
                    {colors.map(({ color, label }) => (
                        <button
                            key={color}
                            className="color-btn"
                            style={{ backgroundColor: color }}
                            onClick={() => handleColorChange(color)}
                            title={label}
                        />
                    ))}
                </div>

                {/* Insert Group */}
                <div className="toolbar-group insert-group">
                    <button onClick={handleLink} title="Insert Link">
                        <i className="fas fa-link"></i>
                    </button>
                    <button onClick={handleImage} title="Insert Image">
                        <i className="fas fa-image"></i>
                    </button>
                </div>

                {/* Alignment Group */}
                <div className="toolbar-group alignment-group">
                    <button onClick={() => handleAlignment('justifyLeft')} title="Align Left">
                        <i className="fas fa-align-left"></i>
                    </button>
                    <button onClick={() => handleAlignment('justifyCenter')} title="Align Center">
                        <i className="fas fa-align-center"></i>
                    </button>
                    <button onClick={() => handleAlignment('justifyRight')} title="Align Right">
                        <i className="fas fa-align-right"></i>
                    </button>
                    <button onClick={() => handleAlignment('justifyFull')} title="Justify">
                        <i className="fas fa-align-justify"></i>
                    </button>
                </div>
            </div>
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
