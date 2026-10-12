import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { BorrowingRecord, ReservationRecord, FineRecord, NotificationItem, Book } from '../../types/index.ts';
import { BookCoverPlaceholder } from '../../components/common/BookCoverPlaceholder.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  BookmarkCheck,
  DollarSign,
  ArrowRight,
  Sparkles,
  Calendar,
  ChevronRight,
  Bell,
  FileText,
} from 'lucide-react';

interface StudentDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [borList, resList, fineList, notifList] = await Promise.all([
        api.getMyBorrowings(user.id),
        api.getMyReservations(user.id),
        api.getFines(user.id),
        api.getNotifications(user.id),
      ]);
      setBorrowings(borList);
      setReservations(resList);
      setFines(fineList);
      setNotifications(notifList);
    } catch (err) {
      console.error('Failed to load student dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const activeBorrowings = borrowings.filter((b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue');
  const overdueBorrowings = activeBorrowings.filter((b) => new Date(b.dueDate) < new Date());
  
  // Books due in <= 4 days
  const dueSoonBorrowings = activeBorrowings.filter((b) => {
    const due = new Date(b.dueDate);
    const now = new Date();
    const diffDays = (due.getTime() - now.getTime()) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 4;
  });

  const activeReservations = reservations.filter((r) => r.status === 'pending');
  const unpaidFines = fines.filter((f) => f.status === 'unpaid');
  const totalUnpaidFineAmount = unpaidFines.reduce((acc, f) => acc + f.amount, 0);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-28 bg-slate-200 rounded-xl w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white shadow-lg overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-blue-600/10 blur-3xl rounded-full pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3 border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              Academic Portal 2026
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
              Manage your active borrowings, track library book due dates, request renewals, access course PDFs, and manage fine payments.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('search')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-5 py-3 rounded-xl shadow-md transition-all self-start md:self-auto shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            Explore Book Catalog
          </button>
        </div>
      </div>

      {/* Due Soon / Overdue Urgent Banner Alert */}
      {overdueBorrowings.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4 text-rose-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-lg text-rose-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950">
                You have {overdueBorrowings.length} overdue book(s)
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Overdue fines accrue daily ($0.50/day). Please return or clear fines promptly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('fines')}
            className="text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Pay Fines
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('borrowings')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Borrowed
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {activeBorrowings.length}
            </span>
            <span className="text-xs text-slate-500">Active loans</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('borrowings')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Due Soon
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {dueSoonBorrowings.length}
            </span>
            <span className="text-xs text-slate-500">In &le; 4 days</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('reservations')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Reservations
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:scale-105 transition-transform">
              <BookmarkCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {activeReservations.length}
            </span>
            <span className="text-xs text-slate-500">In queue</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('fines')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Fines
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:scale-105 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              ${totalUnpaidFineAmount.toFixed(2)}
            </span>
            <span className="text-xs text-rose-600 font-medium">Unsettled</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Currently Borrowed Books + Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2/3): Currently Borrowed Books */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Currently Borrowed Books
              </h3>
              <p className="text-xs text-slate-500">
                Books checked out under your account
              </p>
            </div>
            <button
              onClick={() => setActiveTab('borrowings')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeBorrowings.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-bold text-slate-800">No Active Borrowings</h4>
              <p className="text-xs text-slate-500 mt-1 mb-4">
                You currently have no books checked out from the library.
              </p>
              <button
                onClick={() => setActiveTab('search')}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Search Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrowings.map((b) => {
                const isOverdue = new Date(b.dueDate) < new Date();
                return (
                  <div
                    key={b.id}
                    className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <BookCoverPlaceholder
                        title={b.bookTitle || 'Book Title'}
                        author={b.bookAuthor || 'Author'}
                        category="Book"
                        className="w-14 h-20 shrink-0"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                          {b.bookTitle}
                        </h4>
                        <p className="text-xs text-slate-500">{b.bookAuthor}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">
                            ISBN: {b.bookIsbn}
                          </span>
                          <span className="text-slate-300">&middot;</span>
                          <StatusBadge status={b.status} />
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 text-right">
                      <div className="text-xs">
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                          Due Date
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isOverdue ? 'text-rose-600' : 'text-slate-900'
                          }`}
                        >
                          {new Date(b.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => setActiveTab('borrowings')}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 mt-1"
                      >
                        Details <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column (1/3): Recent Notifications & Digital Quick Link */}
        <div className="space-y-6">
          {/* Notifications Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Notifications</h3>
              </div>
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                View all
              </button>
            </div>

            <div className="space-y-3">
              {notifications.slice(0, 3).map((n) => (
                <div key={n.id} className="p-3 rounded-lg bg-slate-50 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900">
                    <span>{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                    {n.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Digital Resources Card Promo */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-xl p-5 shadow-sm space-y-3">
            <div className="p-2 bg-white/10 w-fit rounded-lg">
              <FileText className="w-5 h-5 text-indigo-300" />
            </div>
            <h4 className="text-sm font-bold">Digital Resource Library</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Access peer-reviewed research papers, course slides, lecture notes, and e-books instantly online.
            </p>
            <button
              onClick={() => setActiveTab('resources')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              Browse Digital Materials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
