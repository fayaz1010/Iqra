import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { motion } from 'framer-motion';

interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  onClose: () => void;
}

const NoteEditor = ({ content, onChange, onClose }: NoteEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const tools = [
    { 
      icon: 'B',
      action: () => editor?.chain().focus().toggleBold().run(),
      isActive: () => editor?.isActive('bold') ?? false,
    },
    {
      icon: 'I',
      action: () => editor?.chain().focus().toggleItalic().run(),
      isActive: () => editor?.isActive('italic') ?? false,
    },
    {
      icon: 'H',
      action: () => editor?.chain().focus().toggleHighlight().run(),
      isActive: () => editor?.isActive('highlight') ?? false,
    },
    {
      icon: '1',
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: () => editor?.isActive('bulletList') ?? false,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl p-4 z-50"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Note</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div className="flex space-x-2 mb-4">
        {tools.map((tool, index) => (
          <button
            key={index}
            onClick={tool.action}
            className={`p-2 rounded ${
              tool.isActive()
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tool.icon}
          </button>
        ))}
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none"
      />

      <style jsx global>{`
        .ProseMirror {
          min-height: 100px;
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          outline: none;
        }
        .ProseMirror p {
          margin: 0.5em 0;
        }
      `}</style>
    </motion.div>
  );
};

export default NoteEditor;
