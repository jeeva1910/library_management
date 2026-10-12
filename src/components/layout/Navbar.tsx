import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { NotificationItem } from '../../types/index.ts';
import {
  Library,
  Bell,
  UserCheck,
  LogOut,
  ChevronDown,
  User as UserIcon,
  CheckCheck,
  Shield,
  GraduationCap,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifPopover, setShowNotifPopover] = useState<boolean>(false);
  const [showUserPopover, setShowUserPopover] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      const list = await api.getNotifications(user.id);
      setNotifications(list);
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!user) return;
    await api.markAllNotificationsRead(user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkSingleRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 whitespace-nowrap shrink-0">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-white block leading-tight">
              Apex Digital Library
            </span>
            <span className="text-[10px] text-blue-300 font-medium tracking-wide uppercase">
              Management Portal
            </span>
          </div>
        </div>

        {/* Zone 2: Role Switcher Quick Pill (for demo convenience) & System Banner */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-lg p-1 text-xs">
          <span className="text-slate-400 font-medium px-2 py-0.5 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Switch Persona:
          </span>
          <button
            onClick={() => switchDemoUser('student')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              user?.role === 'student' && user?.name.startsWith('Alex')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Alex (Student)
          </button>
          <button
            onClick={() => switchDemoUser('student2')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              user?.role === 'student' && user?.name.startsWith('Maya')
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Maya (Student)
          </button>
          <button
            onClick={() => switchDemoUser('admin')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              user?.role === 'admin'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            Librarian Admin
          </button>
        </div>

        {/* Zone 3: Actions - Notifications & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifPopover(!showNotifPopover);
                setShowUserPopover(false);
              }}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              aria-label="View notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-900 animate-pulse" />
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifPopover && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="p-3.5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 font-mono text-xs px-2 py-0.5 rounded-full font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-slate-500 text-xs">
                      No notifications available.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleMarkSingleRead(n.id)}
                        className={`p-3.5 transition-colors cursor-pointer text-xs ${
                          n.isRead ? 'bg-white opacity-80' : 'bg-blue-50/50 font-medium'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-slate-900 block">{n.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            {new Date(n.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowUserPopover(!showUserPopover);
                setShowNotifPopover(false);
              }}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {user?.name.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-semibold text-white block leading-tight">
                  {user?.name}
                </span>
                <span className="text-[10px] text-blue-300 font-mono capitalize">
                  {user?.role === 'admin' ? 'Librarian / Admin' : 'Student'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Menu Popover */}
            {showUserPopover && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-900 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 p-2">
                <div className="p-3 bg-slate-50 rounded-lg mb-2">
                  <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    {user?.role === 'admin' ? (
                      <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <Shield className="w-3 h-3" /> Librarian Admin
                      </span>
                    ) : (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                        <GraduationCap className="w-3 h-3" /> Student ID: {user?.studentId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setShowUserPopover(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
