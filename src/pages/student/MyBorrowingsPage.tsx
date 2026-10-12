import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { BorrowingRecord } from '../../types/index.ts';
import { BookCoverPlaceholder } from '../../components/common/BookCoverPlaceholder.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  BookOpen,
  Calendar,
  RotateCw,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  History,
} from 'lucide-react';

export const MyBorrowingsPage: React.FC = () => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) loadBorrowings();
  }, [user]);

  const loadBorrowings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.getMyBorrowings(user.id);
      setBorrowings(list);
    } catch (e) {
      console.error('Failed to load borrowings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id: string) => {
    setSubmittingId(id);
    setMessage(null);
    try {
      const updated = await api.renewBook(id);
      setMessage({
        type: 'success',
        text: `Successfully renewed! New due date: ${new Date(updated.dueDate).toLocaleDateString()}.`,
      });
      loadBorrowings();
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.message || 'Failed to renew book.',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  const activeBorrowings = borrowings.filter(
    (b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue'
  );

  const historyBorrowings = borrowings.filter((b) => b.status === 'returned');

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Borrowed Books
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track active book loans, review due dates, request online renewals, and view completed reading history.
        </p>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Segmented Tab Controls */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('current')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'current'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Currently Borrowed ({activeBorrowings.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" /> Borrowing History ({historyBorrowings.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : activeTab === 'current' ? (
        activeBorrowings.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Currently Borrowed Books</h3>
            <p className="text-xs text-slate-500 mt-1">
              You do not have any active book loans checked out right now.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeBorrowings.map((b) => {
              const due = new Date(b.dueDate);
              const now = new Date();
              const isOverdue = due < now;
              const diffMs = due.getTime() - now.getTime();
              const daysRemaining = Math.ceil(diffMs / (1000 * 3600 * 24));

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <BookCoverPlaceholder
                      title={b.bookTitle || 'Book'}
                      author={b.bookAuthor || 'Author'}
                      category="Library Book"
                      className="w-16 h-24 shrink-0"
                    />

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={b.status} />
                        {b.renewalCount > 0 && (
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                            Renewed {b.renewalCount}x
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-base text-slate-900 leading-snug">
                        {b.bookTitle}
                      </h3>
                      <p className="text-xs text-slate-500">{b.bookAuthor}</p>

                      <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600">
                        <span>Issued: {new Date(b.issueDate).toLocaleDateString()}</span>
                        <span>ISBN: {b.bookIsbn}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Due Date & Renew Option */}
                  <div className="flex md:flex-col items-end justify-between border-t md:border-0 border-slate-100 pt-3 md:pt-0 text-right">
                    <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Due Date
                      </span>
                      <span
                        className={`text-sm font-bold font-mono ${
                          isOverdue ? 'text-rose-600' : 'text-slate-900'
                        }`}
                      >
                        {due.toLocaleDateString()}
                      </span>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {isOverdue
                          ? 'OVERDUE - Fine Accruing'
                          : `${daysRemaining} day(s) remaining`}
                      </p>
                    </div>

                    {!isOverdue ? (
                      <button
                        onClick={() => handleRenew(b.id)}
                        disabled={submittingId === b.id || b.renewalCount >= 2}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCw
                          className={`w-3.5 h-3.5 ${
                            submittingId === b.id ? 'animate-spin' : ''
                          }`}
                        />
                        {b.renewalCount >= 2 ? 'Max Renewals Reached' : 'Renew Loan'}
                      </button>
                    ) : (
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                        Please Return to Library Desk
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : historyBorrowings.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Returned History</h3>
          <p className="text-xs text-slate-500 mt-1">
            Your past returned borrowing records will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Book Title & Author</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Returned Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {historyBorrowings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{b.bookTitle}</span>
                    <span className="text-[11px] text-slate-500">{b.bookAuthor}</span>
                  </td>
                  <td className="p-4 font-mono">{new Date(b.issueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono">{new Date(b.dueDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono text-emerald-700 font-bold">
                    {b.returnDate ? new Date(b.returnDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="p-4">
                    <StatusBadge status="returned" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
