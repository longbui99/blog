import React, { forwardRef } from 'react';
import ColorGroup from './ColorGroup';
import InsertGroup from './InsertGroup';
import AlignmentGroup from './AlignmentGroup';
import HeadingGroup from './HeadingGroup';

const EditorToolbar = forwardRef(({ 
    onColorChange, 
    onAlignment, 
    onLink, 
    onImage, 
    onInlineCode, 
    onCodeBlock,
    onHeading 
}, ref) => {
    return (
        <div ref={ref} className="editor-toolbar">
            <HeadingGroup onHeading={onHeading} />
            <ColorGroup onColorChange={onColorChange} />
            <InsertGroup 
                onLink={onLink} 
                onImage={onImage}
                onInlineCode={onInlineCode}
                onCodeBlock={onCodeBlock}
            />
            <AlignmentGroup onAlignment={onAlignment} />
        </div>
    );
});

EditorToolbar.displayName = 'EditorToolbar';

export default EditorToolbar; 