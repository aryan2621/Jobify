import React from 'react';
const Editor = dynamic(
    () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
    { ssr: false }
);
import '../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState } from 'draft-js';
import dynamic from 'next/dynamic';

interface EditorElementProps {
    content: EditorState;
    setContent: (content: EditorState) => void;
    placeholder: string;
}

export const EditorElement: React.FC<EditorElementProps> = ({
    content,
    setContent,
    placeholder,
}) => {
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
                onEditorStateChange={setContent}
                toolbarClassName='toolbar-class'
                wrapperClassName='wrapper-class'
                editorClassName='editor-class'
            />
        </div>
    );
};
