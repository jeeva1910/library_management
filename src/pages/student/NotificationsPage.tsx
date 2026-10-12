import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { NotificationItem } from '../../types/index.ts';
import { Bell, CheckCheck, Clock, AlertTriangle, BookmarkCheck, DollarSign, Info } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await api.getNotifications(user.id);
      setNotifications(list);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    await api.markAllNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.isRead : true));

  const getIcon = (type: string) => {
    switch (type) {
      case 'overdue':
      case 'fine_added':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      case 'due_soon':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'reservation_ready':
        return <BookmarkCheck className="w-5 h-5 text-indigo-600" />;
      default:
        return <Bell className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications & System Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time due-date reminders, overdue warnings, reservation status updates, and fine notifications.
          </p>
        </div>

        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            filter === 'unread'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Notifications</h3>
          <p className="text-xs text-slate-500 mt-1">
            You do not have any notifications matching this view.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100 shadow-xs">
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => handleMarkRead(n.id)}
              className={`p-4 flex items-start justify-between gap-4 transition-colors cursor-pointer ${
                n.isRead ? 'bg-white' : 'bg-blue-50/40'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 bg-slate-100 rounded-lg shrink-0 mt-0.5">
                  {getIcon(n.type)}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              </div>

              <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
