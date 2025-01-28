"use client";

import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import EmojiPicker from "emoji-picker-react";
import { cn } from "@/lib/utils";
import HardBreak from "@tiptap/extension-hard-break"; // Import HardBreak extension

const TiptapEditor = ({ setMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasEdited, setHasEdited] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit, // Includes basic text formatting options like bold, italic, etc.
      HardBreak,
    ],
    content: "<p>Escribe tu mensaje aqui 👇</p>",
    onUpdate: ({ editor }) => {
      // Whenever the editor content updates, set it to the parent component's state
      setMessage(editor.getText());
    },
  });

  // Handle emoji selection
  const handleEmojiClick = (emojiObject) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiObject.emoji).run();
      setShowEmojiPicker(false); // Hide the picker after selecting emoji
    }
  };

  const handleEditorClick = () => {
    if (editor) {
      editor.chain().focus().run();
    }
  };

  const handleEditorFocus = () => {
    if (editor && !hasEdited) {
      // Select all content on first interaction
      editor
        .chain()
        .setTextSelection({ from: 0, to: editor.state.doc.content.size })
        .focus()
        .run();
      setHasEdited(true); // Mark as interacted
    } else if (editor) {
      editor.chain().focus().run();
    }
  };

  return (
    <div
      onClick={() => {
        if (showEmojiPicker) {
          setShowEmojiPicker(false);
        }
        handleEditorFocus();
      }}
      className="h-full w-full items-center flex flex-col gap-2 bg-white overflow-hidden"
    >
      <div className="border rounded-lg p-2 flex gap-2 ">
        {/* Toolbar with Bold, Italic, Emoji Button */}
        {editor && (
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="px-2 py-1 text-sm border rounded-md"
          >
            Emojis 👈
          </button>
        )}
        {editor && (
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={cn(
              "px-2 py-1 text-sm border rounded-md ",
              editor.isActive("bold") ? "bg-gray-100" : ""
            )}
          >
            Negritas
          </button>
        )}

        {editor && (
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={cn(
              "px-2 py-1 text-sm border rounded-md ",
              editor.isActive("italic") ? "bg-gray-100" : ""
            )}
          >
            Italica
          </button>
        )}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute mt-2 bg-white p-2 z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Tiptap Editor Content */}
      <div
        onClick={() => {
          if (showEmojiPicker) {
            setShowEmojiPicker(false);
          }
          handleEditorFocus();
        }}
        className="h-full w-full flex justify-center   rounded-lg p-2 overflow-auto"
        style={{ whiteSpace: "pre-wrap" }}
      >
        <EditorContent editor={editor} className="!max-w-xs" />
      </div>
    </div>
  );
};

export default TiptapEditor;
