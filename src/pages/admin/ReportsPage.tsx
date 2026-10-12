import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { ReportSummary, BorrowingRecord } from '../../types/index.ts';
import { Modal } from '../../components/common/Modal.tsx';
import { BarChart2, Download, Printer, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [borrowings, setBorrowings] = useState<BorrowingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [repData, borData] = await Promise.all([
        api.getReports(),
        api.getAllBorrowings(),
      ]);
      setReport(repData);
      setBorrowings(borData);
    } catch (e) {
      console.error('Failed loading reports', e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!report) return;
    const csvRows = [
      ['Metric', 'Value'],
      ['Period', report.period],
      ['Total Transactions', report.totalTransactions],
      ['Total Returns', report.totalReturns],
      ['Total Overdues', report.totalOverdues],
      ['Total Fine Revenue ($)', report.totalFineRevenue],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Apex_Library_Report_Fall_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  if (loading || !report) {
    return <div className="p-8 h-64 bg-slate-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Library Analytics & Academic Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate circulation activity summaries, overdue list audit logs, and fine revenue collection reports.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" /> Printable View
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Library Report CSV exported to downloads!</span>
        </div>
      )}

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Report Period
          </span>
          <span className="text-sm font-extrabold text-slate-900 mt-1 block">
            {report.period}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Issue Transactions
          </span>
          <span className="text-2xl font-extrabold font-mono text-slate-900 mt-1 block">
            {report.totalTransactions}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Completed Returns
          </span>
          <span className="text-2xl font-extrabold font-mono text-emerald-700 mt-1 block">
            {report.totalReturns}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Fine Revenue Collected
          </span>
          <span className="text-2xl font-extrabold font-mono text-blue-700 mt-1 block">
            ${report.totalFineRevenue.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Most Active Student Borrowers
          </h3>
          <div className="space-y-2">
            {report.frequentBorrowers.map((fb, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{fb.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{fb.email}</span>
                </div>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {fb.count} loans
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
            Circulation Share by Category
          </h3>
          <div className="space-y-2">
            {report.topCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{cat.category}</span>
                  <span className="font-mono text-slate-900">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Printable View Modal */}
      {showPrintModal && (
        <Modal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          title="Printable Capstone Report View"
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs text-slate-800 p-4 border border-slate-200 bg-white rounded-xl font-sans">
            <div className="border-b border-slate-300 pb-4 text-center">
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Apex University Digital Library Management System
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official Circulation Analytics & Financial Fine Summary Report
              </p>
              <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                Generated: {new Date().toLocaleString()} &middot; Period: {report.period}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg font-mono">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Transactions</span>
                <span className="font-bold text-sm">{report.totalTransactions}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Total Returns</span>
                <span className="font-bold text-sm text-emerald-700">{report.totalReturns}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Overdue Records</span>
                <span className="font-bold text-sm text-rose-600">{report.totalOverdues}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Revenue Collected</span>
                <span className="font-bold text-sm text-blue-700">${report.totalFineRevenue.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print Document
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
