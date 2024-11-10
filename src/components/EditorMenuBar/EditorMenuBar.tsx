import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import { Editor } from '@tiptap/react';

interface EditorMenuBarProps {
    editor: Editor | null;
}

const EditorMenuBar: React.FC<EditorMenuBarProps> = ({ editor }) => {
    if (!editor) {
        return null;
    }

    return (
        <ButtonGroup variant="outlined" aria-label="outlined button group">
            <Button onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()}>
                Bold
            </Button>
            <Button onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()}>
                Italic
            </Button>
            <Button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} disabled={!editor.can().chain().focus().toggleHeading({ level: 1 }).run()}>
                H1
            </Button>
            <Button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} disabled={!editor.can().chain().focus().toggleHeading({ level: 2 }).run()}>
                H2
            </Button>
            <Button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} disabled={!editor.can().chain().focus().toggleHeading({ level: 3 }).run()}>
                H3
            </Button>
            <Button onClick={() => editor.chain().focus().setParagraph().run()} disabled={!editor.can().chain().focus().setParagraph().run()}>
                Paragraph
            </Button>
            <Button onClick={() => editor.chain().focus().toggleBulletList().run()} disabled={!editor.can().chain().focus().toggleBulletList().run()}>
                Bullet List
            </Button>
            <Button onClick={() => editor.chain().focus().toggleOrderedList().run()} disabled={!editor.can().chain().focus().toggleOrderedList().run()}>
                Ordered List
            </Button>
            <Button onClick={() => editor.chain().focus().toggleBlockquote().run()} disabled={!editor.can().chain().focus().toggleBlockquote().run()}>
                Blockquote
            </Button>
            <Button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                Horizontal Rule
            </Button>
            <Button onClick={() => editor.chain().focus().setHardBreak().run()}>
                Hard Break
            </Button>
            <Button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().chain().focus().undo().run()}>
                Undo
            </Button>
            <Button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().chain().focus().redo().run()}>
                Redo
            </Button>
        </ButtonGroup>
    );
};

export default EditorMenuBar;