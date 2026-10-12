import React from 'react';
import { BorrowStatus, ReservationStatus, FineStatus } from '../../types/index.js';

interface StatusBadgeProps {
  status: BorrowStatus | ReservationStatus | FineStatus | 'available' | 'unavailable';
  label?: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const getStyle = () => {
    switch (status) {
      case 'available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'unavailable':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'borrowed':
      case 'renewed':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'overdue':
      case 'unpaid':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'returned':
      case 'paid':
      case 'fulfilled':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'cancelled':
      case 'waived':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formattedLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${getStyle()} ${className}`}
    >
      {formattedLabel}
    </span>
  );
};
