import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { ReservationRecord } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Clock, CheckCircle2, XCircle, BookmarkCheck } from 'lucide-react';

export const ReservationManagementPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const list = await api.getAllReservations();
      setReservations(list);
    } catch (e) {
      console.error('Failed to load reservations', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'fulfilled' | 'cancelled') => {
    try {
      await api.updateReservationStatus(id, status);
      loadReservations();
    } catch (e) {
      console.error('Failed status update', e);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reservation Queue Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor student book reservation queues and mark reservations as fulfilled or cancelled.
        </p>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Reservations</h3>
          <p className="text-xs text-slate-500 mt-1">There are no student book reservations on file.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Student Name</th>
                <th className="p-4">Book Title</th>
                <th className="p-4">Reservation Date</th>
                <th className="p-4">Queue Position</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {reservations.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-bold text-slate-900">{r.userName || r.userId}</td>
                  <td className="p-4 font-bold text-slate-900">{r.bookTitle}</td>
                  <td className="p-4 font-mono">{new Date(r.reservationDate).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-bold text-blue-600">#{r.queuePosition}</td>
                  <td className="p-4">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="p-4 text-right">
                    {r.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'fulfilled')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-xs font-semibold hover:bg-emerald-700"
                        >
                          Fulfill
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(r.id, 'cancelled')}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded text-xs font-semibold hover:bg-slate-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-mono text-[11px] uppercase">{r.status}</span>
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
