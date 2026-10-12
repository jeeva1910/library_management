import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { User } from '../../types/index.ts';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export const NotificationsManagementPage: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [targetStudentId, setTargetStudentId] = useState<string>('all');
  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const list = await api.getUsers();
      setStudents(list.filter((u) => u.role === 'student'));
    } catch (e) {
      console.error('Failed loading students', e);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !messageText) return;
    setIsSending(true);
    setSuccess(false);
    try {
      if (targetStudentId === 'all') {
        // Send to all students
        await Promise.all(
          students.map((s) => api.sendNotification(s.id, title, messageText, 'announcement'))
        );
      } else {
        await api.sendNotification(targetStudentId, title, messageText, 'announcement');
      }
      setSuccess(true);
      setTitle('');
      setMessageText('');
    } catch (e) {
      console.error('Failed sending notification', e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Broadcast System Notifications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Send official announcements, due-date notices, or library policy updates to students.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Notification dispatched successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSend} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Target Recipient *</label>
            <select
              value={targetStudentId}
              onChange={(e) => setTargetStudentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">Broadcast to All Enrolled Students ({students.length})</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  Direct Message: {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Notification Header Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. End of Semester Library Book Return Policy"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Message Body *</label>
            <textarea
              rows={4}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Enter message details to display inside student dashboard feed..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isSending ? 'Sending...' : 'Broadcast Notification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
