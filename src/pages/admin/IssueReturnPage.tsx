import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { User, Book, BorrowingRecord, FineRecord } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  Repeat,
  CheckCircle2,
  XCircle,
  UserCheck,
  BookOpen,
  Calendar,
  AlertCircle,
  DollarSign,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const IssueReturnPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'issue' | 'return'>('issue');
  const [students, setStudents] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Issue Form State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Return Form State
  const [returnResult, setReturnResult] = useState<{
    borrowing: BorrowingRecord;
    fine?: FineRecord;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersList, booksList, borList] = await Promise.all([
        api.getUsers(),
        api.getBooks(),
        api.getAllBorrowings(),
      ]);
      setStudents(usersList.filter((u) => u.role === 'student'));
      setBooks(booksList);
      setBorrowings(borList);
      if (usersList.filter((u) => u.role === 'student').length > 0) {
        setSelectedStudentId(usersList.filter((u) => u.role === 'student')[0].id);
      }
      if (booksList.filter((b) => b.availableCopies > 0).length > 0) {
        setSelectedBookId(booksList.filter((b) => b.availableCopies > 0)[0].id);
      }
    } catch (e) {
      console.error('Failed loading data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedBookId) return;
    setSubmitting(true);
    setMessage(null);
    try {
      const res = await api.issueBook(selectedStudentId, selectedBookId, dueDate);
      const studentName = students.find((s) => s.id === selectedStudentId)?.name || 'Student';
      setMessage({
        type: 'success',
        text: `Issued "${res.bookTitle}" to ${studentName}. Due date: ${new Date(res.dueDate).toLocaleDateString()}.`,
      });
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to issue book' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcessReturn = async (borrowingId: string) => {
    setSubmitting(true);
    setMessage(null);
    setReturnResult(null);
    try {
      const res = await api.returnBook(borrowingId);
      setReturnResult(res);
      if (res.fine) {
        setMessage({
          type: 'error',
          text: `Book returned late (${res.fine.overdueDays} days overdue). Fine generated: $${res.fine.amount.toFixed(2)}.`,
        });
      } else {
        setMessage({
          type: 'success',
          text: `Book returned successfully on time! Copy count restored.`,
        });
      }
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to process return' });
    } finally {
      setSubmitting(false);
    }
  };

  const activeBorrowings = borrowings.filter(
    (b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue'
  );

  const selectedBookObject = books.find((b) => b.id === selectedBookId);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Book Circulation & Return Desk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Issue books to students, process physical returns, automatically calculate overdue fine balances, and restore copy availability.
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

      {/* Tab Controls */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('issue')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'issue'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Repeat className="w-4 h-4" /> Issue Book to Student
        </button>
        <button
          onClick={() => setActiveTab('return')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            activeTab === 'return'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <RotateCcw className="w-4 h-4" /> Process Return ({activeBorrowings.length} Active Loans)
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : activeTab === 'issue' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Issue Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3">
              Book Issuance Transaction Form
            </h3>

            <form onSubmit={handleIssueBook} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  1. Select Student Account *
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.email}) - ID: {s.studentId}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  2. Select Book Title *
                </label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {books.map((b) => (
                    <option
                      key={b.id}
                      value={b.id}
                      disabled={b.availableCopies <= 0}
                    >
                      {b.title} - {b.availableCopies}/{b.totalCopies} Copies Available ({b.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  3. Due Date (Default: 14 Days) *
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || (selectedBookObject && selectedBookObject.availableCopies <= 0)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Repeat className="w-4 h-4" /> Issue Book & Update Inventory
                </button>
              </div>
            </form>
          </div>

          {/* Book Availability Preview Box */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-blue-300">
                Book Availability Check
              </span>
              {selectedBookObject ? (
                <div className="mt-3 space-y-3">
                  <h4 className="font-bold text-base text-white">{selectedBookObject.title}</h4>
                  <p className="text-xs text-slate-300">{selectedBookObject.author}</p>
                  <div className="p-3 bg-white/10 rounded-xl space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Copies:</span>
                      <span className="font-bold text-emerald-400">
                        {selectedBookObject.availableCopies} / {selectedBookObject.totalCopies}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Shelf Location:</span>
                      <span className="text-white">{selectedBookObject.locationRack || 'GEN-A1'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 mt-2">No book selected</p>
              )}
            </div>

            <div className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              Issuing a book will automatically reduce available stock by 1 copy and record the due date transaction.
            </div>
          </div>
        </div>
      ) : (
        /* Return Tab View */
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Student Name & ID</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Due Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {activeBorrowings.map((b) => {
                const isOverdue = new Date(b.dueDate) < new Date();
                return (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{b.userName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{b.userEmail}</span>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{b.bookTitle}</span>
                      <span className="text-[11px] text-slate-500">ISBN: {b.bookIsbn}</span>
                    </td>
                    <td className="p-4 font-mono">{new Date(b.issueDate).toLocaleDateString()}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">
                      <span className={isOverdue ? 'text-rose-600' : ''}>
                        {new Date(b.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleProcessReturn(b.id)}
                        disabled={submitting}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors"
                      >
                        Process Return
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
