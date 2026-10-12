import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { LibrarySettings } from '../../types/index.ts';
import { Shield, Settings, Save, CheckCircle2, Database, Server, RefreshCw } from 'lucide-react';

interface MongoStatus {
  connected: boolean;
  uri: string;
  databaseName?: string;
  error?: string;
}

export const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<LibrarySettings | null>(null);
  const [mongoStatus, setMongoStatus] = useState<MongoStatus | null>(null);
  const [libraryName, setLibraryName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [maxLoanDays, setMaxLoanDays] = useState(14);
  const [maxBooksPerStudent, setMaxBooksPerStudent] = useState(5);
  const [finePerDay, setFinePerDay] = useState(0.5);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
    loadMongoStatus();
  }, []);

  const loadSettings = async () => {
    try {
      const cfg = await api.getSettings();
      setSettings(cfg);
      setLibraryName(cfg.libraryName);
      setContactEmail(cfg.contactEmail);
      setMaxLoanDays(cfg.maxLoanDays);
      setMaxBooksPerStudent(cfg.maxBooksPerStudent);
      setFinePerDay(cfg.finePerDay);
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const loadMongoStatus = async () => {
    try {
      const res = await fetch('/api/admin/mongodb-status');
      const data = await res.json();
      setMongoStatus(data);
    } catch (e) {
      console.error('Failed fetching mongo status', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess(false);
    try {
      await api.updateSettings({
        libraryName,
        contactEmail,
        maxLoanDays,
        maxBooksPerStudent,
        finePerDay,
      });
      setSuccess(true);
    } catch (e) {
      console.error('Failed saving settings', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Librarian Account & System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure general library operations, borrowing limits, contact details, and MongoDB database connections.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Library configuration settings saved!</span>
        </div>
      )}

      {/* MongoDB Database Connection Status Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">MongoDB Database Connection</h3>
          </div>
          <button
            onClick={loadMongoStatus}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh MongoDB connection status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">
              Connection State
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  mongoStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold text-white">
                {mongoStatus?.connected
                  ? 'Connected to MongoDB'
                  : 'JSON / Memory Persistence Layer Active'}
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-[10px] text-slate-400 font-sans uppercase font-bold">
              Target Database / URI
            </span>
            <span className="text-slate-300 font-mono block truncate" title={mongoStatus?.uri}>
              {mongoStatus?.databaseName
                ? `DB: ${mongoStatus.databaseName}`
                : mongoStatus?.uri || 'mongodb://127.0.0.1:27017/digital_library'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          To connect to MongoDB Atlas or a remote MongoDB server, set the <code className="bg-slate-800 px-1.5 py-0.5 rounded text-amber-300 font-mono">MONGODB_URI</code> environment variable (e.g. <code className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 font-mono">mongodb+srv://user:pass@cluster.mongodb.net/digital_library</code>). Mongoose automatically syncs users, books, loans, fine records, and resources!
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2.5 py-0.5 rounded flex items-center gap-1 mt-1.5 w-fit">
              <Shield className="w-3.5 h-3.5" /> Head Librarian / System Admin
            </span>
          </div>
        </div>

        {/* Global Library System Settings */}
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" /> Global Library Policy Parameters
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Library Name</label>
              <input
                type="text"
                required
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Email</label>
              <input
                type="email"
                required
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Standard Loan Duration (Days)</label>
              <input
                type="number"
                min="1"
                required
                value={maxLoanDays}
                onChange={(e) => setMaxLoanDays(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Max Books Per Student</label>
              <input
                type="number"
                min="1"
                required
                value={maxBooksPerStudent}
                onChange={(e) => setMaxBooksPerStudent(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save System Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
