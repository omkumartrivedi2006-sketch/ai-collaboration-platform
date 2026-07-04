import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Button from './Button';
import Avatar from './Avatar';
import { Edit2, Trash2, Send, X, Check } from 'lucide-react';

const CommentBox = ({ comments = [], onAddComment, onUpdateComment, onDeleteComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await onAddComment(commentText);
      setCommentText('');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditText(c.comment);
  };

  const handleUpdate = async (id) => {
    if (!editText.trim()) return;
    try {
      await onUpdateComment(id, editText);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="flex gap-3 items-start">
        <Avatar src={user?.avatar} name={user?.name} size="sm" />
        <div className="flex-1 min-w-0">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Write a comment..."
            maxLength={1000}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" size="xs" loading={submitting} disabled={!commentText.trim()}>
              <Send className="h-3 w-3 mr-1" /> Comment
            </Button>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        {comments.map((c) => {
          const isOwner = user?.id === c.userId || user?.role === 'Admin';
          const isEditing = editingId === c.id;

          return (
            <div key={c.id} className="flex gap-3 items-start">
              <Avatar src={c.user?.avatar} name={c.user?.name} size="sm" />
              <div className="flex-1 min-w-0 bg-slate-50/50 border border-slate-100 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold text-slate-800">{c.user?.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                    {isOwner && !isEditing && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => startEdit(c)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete comment?')) onDeleteComment(c.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      className="w-full p-2 bg-white border border-slate-250 rounded text-xs focus:outline-none"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleUpdate(c.id)}
                        className="p-1 text-emerald-600 hover:text-emerald-700 hover:bg-slate-100 rounded cursor-pointer"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-650 font-semibold whitespace-pre-wrap leading-relaxed">
                    {c.comment}
                  </p>
                )}
              </div>
            </div>
          );
        })}
        {comments.length === 0 && (
          <p className="text-center py-4 text-xs text-slate-400 italic font-bold">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default CommentBox;
