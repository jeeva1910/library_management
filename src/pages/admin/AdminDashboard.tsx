import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { DashboardStats } from '../../types/index.ts';
import { BarChart, AreaTrendChart, CategoryDonutChart } from '../../components/common/Charts.tsx';
import {
  BookOpen,
  Users,
  Clock,
  DollarSign,
  AlertTriangle,
  BookmarkCheck,
  Repeat,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error('Failed to load dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="h-24 bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Librarian Administrative Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time library analytics, circulation overview, book inventory status, and automated fine metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('admin_issue_return')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Repeat className="w-4 h-4" /> Issue / Return Book
          </button>
          <button
            onClick={() => setActiveTab('admin_books')}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Add New Book
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('admin_books')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Books & Copies
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {stats.totalBooks}
            </span>
            <span className="text-xs font-mono text-emerald-600 font-bold">
              {stats.availableBooks} Available
            </span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('admin_issue_return')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-indigo-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Borrowed Books
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Repeat className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {stats.borrowedBooks}
            </span>
            <span className="text-xs text-slate-500">Out on loan</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('admin_users')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-teal-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Enrolled Students
            </span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-slate-900">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-slate-500">Registered users</span>
          </div>
        </div>

        <div
          onClick={() => setActiveTab('admin_issue_return')}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-rose-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Overdue Books
            </span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold font-mono text-rose-600">
              {stats.overdueBooksCount}
            </span>
            <span className="text-xs text-rose-600 font-medium">Attention needed</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AreaTrendChart
            data={stats.monthlyBorrowingActivity}
            title="Monthly Circulation Activity Trend"
            subtitle="Total book issue and renewal transactions over the past 6 months"
          />
        </div>

        <div>
          <CategoryDonutChart
            data={stats.categoryBreakdown}
            title="Book Distribution by Category"
          />
        </div>
      </div>

      {/* Most Borrowed Books Bar Chart & Fine Revenue Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BarChart
            data={stats.mostBorrowedBooks.map((b) => ({
              label: b.title,
              value: b.count,
              secondaryLabel: 'borrows',
            }))}
            title="Most Borrowed Books (Top 5)"
            subtitle="Highest circulation books requested by students"
            barColor="bg-blue-600"
          />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">Fine Revenue Statistics</h3>
            </div>
            <p className="text-xs text-slate-500">
              Total overdue fines generated and settled online via digital payment gateways.
            </p>

            <div className="mt-6 space-y-3 font-mono">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500 font-sans">Total Accrued Fines:</span>
                <span className="font-bold text-slate-900">${stats.totalFinesAmount.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between text-xs">
                <span className="text-emerald-800 font-sans font-semibold">Collected Revenue:</span>
                <span className="font-extrabold text-emerald-700">${stats.collectedFinesAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('admin_fines')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors text-center"
          >
            Manage Fine Ledger
          </button>
        </div>
      </div>
    </div>
  );
};
