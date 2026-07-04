import React, { useState } from 'react';
import { Smile } from 'lucide-react';

const EmojiPicker = ({ onSelect }) => {
  const [open, setOpen] = useState(false);
  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🎉', '🔥', '🚀', '👀', '✅', '❌'];

  const handleSelect = (emoji) => {
    onSelect(emoji);
    setOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-1 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-md cursor-pointer transition-colors"
      >
        <Smile className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-8 z-50 bg-white border border-slate-100 rounded-xl p-2 shadow-lg w-48 grid grid-cols-4 gap-1.5">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => handleSelect(emoji)}
                className="text-base p-1 hover:bg-slate-50 rounded-md cursor-pointer transition-colors text-center"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default EmojiPicker;
