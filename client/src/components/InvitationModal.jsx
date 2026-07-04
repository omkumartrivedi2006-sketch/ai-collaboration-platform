import React, { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export const InvitationModal = ({ isOpen, onClose }) => {
  const { createInvitation, departments, fetchDepartments } = useAdmin();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [departmentId, setDepartmentId] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && departments.length === 0) {
      fetchDepartments();
    }
  }, [isOpen, departments.length, fetchDepartments]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setSending(true);
    try {
      await createInvitation({
        email,
        role,
        departmentId: departmentId || undefined
      });
      setEmail('');
      setRole('Employee');
      setDepartmentId('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans text-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-slate-805 text-sm uppercase tracking-wider">Invite Team Member</h3>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Send a secure registration invitation token</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-655 rounded-lg cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Recipient Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@company.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold mb-1 uppercase tracking-wider text-[8px]">Assigned Department</label>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">-- None --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="cursor-pointer px-4 py-2 bg-indigo-605 hover:bg-indigo-705 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{sending ? 'Sending invite...' : 'Send Invitation'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default InvitationModal;
