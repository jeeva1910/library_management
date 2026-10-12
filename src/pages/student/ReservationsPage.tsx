import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { ReservationRecord } from '../../types/index.ts';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Clock, BookmarkCheck, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReservationsPage: React.FC = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadReservations();
  }, [user]);

  const loadReservations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.getMyReservations(user.id);
      setReservations(list);
    } catch (e) {
      console.error('Failed to load reservations', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await api.updateReservationStatus(id, 'cancelled');
      loadReservations();
    } catch (e) {
      console.error('Failed to cancel reservation', e);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          My Book Reservations
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          When a book has 0 available copies, student reservations place you in line. You will receive an alert as soon as a copy is returned.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : reservations.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Reservations</h3>
          <p className="text-xs text-slate-500 mt-1">
            You do not have any active book reservations at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reservations.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <StatusBadge status={res.status} />
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(res.reservationDate).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {res.bookTitle}
                </h3>
                <p className="text-xs text-slate-500">{res.bookAuthor}</p>

                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Queue Position:</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">
                    #{res.queuePosition} in line
                  </span>
                </div>
              </div>

              {res.status === 'pending' && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleCancel(res.id)}
                    disabled={cancellingId === res.id}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1.5 p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Cancel Reservation
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
