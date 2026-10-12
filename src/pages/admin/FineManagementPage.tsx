import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { FineRecord, LibrarySettings } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { DollarSign, Settings, CheckCircle2, Save } from 'lucide-react';

export const FineManagementPage: React.FC = () => {
  const [fines, setFines] = useState<FineRecord[]>([]);
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [finePerDay, setFinePerDay] = useState<number>(0.5);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [finesList, cfg] = await Promise.all([
        api.getFines(),
        api.getSettings(),
      ]);
      setFines(finesList);
      setSettings(cfg);
      setFinePerDay(cfg.finePerDay);
    } catch (e) {
      console.error('Failed loading fines data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRate = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await api.updateSettings({ finePerDay });
      setMessage(`Updated fine rate to $${finePerDay.toFixed(2)} per day.`);
      loadData();
    } catch (e) {
      console.error('Failed updating fine rate', e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkPaid = async (fineId: string) => {
    try {
      await api.payFine(fineId, 'Admin Manual Adjustment', `ADM-${Date.now()}`);
      loadData();
    } catch (e) {
      console.error('Failed marking fine paid', e);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Fine Ledger & Rate Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure daily overdue fine rate parameters, oversee student balances, and record manual payments.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Rate Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">Configurable Overdue Fine Rate</h3>
          </div>
          <p className="text-xs text-slate-500">
            Current fine formula: <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">fine = overdue_days &times; fine_per_day</code>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
            <input
              type="number"
              step="0.10"
              min="0.10"
              value={finePerDay}
              onChange={(e) => setFinePerDay(parseFloat(e.target.value) || 0.5)}
              className="w-28 pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">/ day</span>
          <button
            onClick={handleSaveRate}
            disabled={isSaving}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Save className="w-3.5 h-3.5" /> Save Rate
          </button>
        </div>
      </div>

      {/* Fines Table */}
      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Overdue Days</th>
                <th className="p-4">Fine Rate</th>
                <th className="p-4">Fine Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {fines.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{f.userName}</td>
                  <td className="p-4 font-bold text-slate-900">{f.bookTitle}</td>
                  <td className="p-4 font-mono">{f.overdueDays} days</td>
                  <td className="p-4 font-mono text-slate-500">${f.finePerDay.toFixed(2)}/day</td>
                  <td className="p-4 font-mono font-extrabold text-slate-900 text-sm">
                    ${f.amount.toFixed(2)}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={f.status} />
                  </td>
                  <td className="p-4 text-right">
                    {f.status === 'unpaid' ? (
                      <button
                        onClick={() => handleMarkPaid(f.id)}
                        className="px-3 py-1 bg-emerald-600 text-white font-semibold rounded text-xs hover:bg-emerald-700 transition-colors"
                      >
                        Mark Paid
                      </button>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px]">
                        Ref: {f.transactionRef || 'PAID'}
                      </span>
                    )}
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
