import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  LayoutDashboard,
  Search,
  BookMarked,
  Clock,
  FileText,
  Bell,
  CreditCard,
  User,
  LogOut,
  BookOpenCheck,
  Users,
  Repeat,
  BarChart2,
  Settings,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'search', label: 'Search Books', icon: Search },
    { id: 'borrowings', label: 'My Borrowings', icon: BookMarked },
    { id: 'reservations', label: 'Reservations', icon: Clock },
    { id: 'resources', label: 'Digital Resources', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'fines', label: 'Fines', icon: CreditCard },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { id: 'admin_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin_books', label: 'Books', icon: BookOpenCheck },
    { id: 'admin_users', label: 'Users', icon: Users },
    { id: 'admin_issue_return', label: 'Issue / Return', icon: Repeat },
    { id: 'admin_reservations', label: 'Reservations', icon: Clock },
    { id: 'admin_resources', label: 'Digital Resources', icon: FileText },
    { id: 'admin_notifications', label: 'Notifications', icon: Bell },
    { id: 'admin_fines', label: 'Fines', icon: CreditCard },
    { id: 'admin_reports', label: 'Reports', icon: BarChart2 },
    { id: 'admin_profile', label: 'Profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)] select-none">
      <div className="p-4 space-y-6">
        {/* Role Portal Header Indicator */}
        <div className="px-3 py-2 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAdmin ? 'bg-indigo-400' : 'bg-blue-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-200 tracking-wide uppercase">
              {isAdmin ? 'Librarian Console' : 'Student Portal'}
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign Out Button */}
      <div className="p-4 border-t border-slate-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-950/30 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
