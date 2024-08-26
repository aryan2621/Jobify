import React from 'react';
import dynamic from 'next/dynamic';
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';
const Editor = dynamic(() => import('react-draft-wysiwyg').then((mod) => mod.Editor), {
    ssr: false,
});

interface EditorElementProps {
    content: EditorState;
    onValueChange: (content: EditorState) => void;
    placeholder: string;
}

export const EditorElement: React.FC<EditorElementProps> = ({ content, onValueChange, placeholder }) => {
    return (
        <div className='editor-container'>
            <Editor
                editorState={content}
                editorStyle={{
                    border: '1.5px solid #f1f1f1',
                    minHeight: '200px',
                    padding: '0 10px',
                    borderRadius: '5px',
                }}
                placeholder={placeholder}
                onEditorStateChange={onValueChange}
                toolbarClassName='toolbar-class'
                wrapperClassName='wrapper-class'
                editorClassName='editor-class'
            />
        </div>
    );
};
