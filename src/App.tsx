import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Navbar } from './components/layout/Navbar.tsx';
import { Sidebar } from './components/layout/Sidebar.tsx';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard.tsx';
import { BookSearchPage } from './pages/student/BookSearchPage.tsx';
import { MyBorrowingsPage } from './pages/student/MyBorrowingsPage.tsx';
import { ReservationsPage } from './pages/student/ReservationsPage.tsx';
import { DigitalResourcesPage } from './pages/student/DigitalResourcesPage.tsx';
import { NotificationsPage } from './pages/student/NotificationsPage.tsx';
import { FinesPage } from './pages/student/FinesPage.tsx';
import { ProfilePage } from './pages/student/ProfilePage.tsx';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.tsx';
import { BookManagementPage } from './pages/admin/BookManagementPage.tsx';
import { IssueReturnPage } from './pages/admin/IssueReturnPage.tsx';
import { ReservationManagementPage } from './pages/admin/ReservationManagementPage.tsx';
import { DigitalResourceManagementPage } from './pages/admin/DigitalResourceManagementPage.tsx';
import { UserManagementPage } from './pages/admin/UserManagementPage.tsx';
import { FineManagementPage } from './pages/admin/FineManagementPage.tsx';
import { NotificationsManagementPage } from './pages/admin/NotificationsManagementPage.tsx';
import { ReportsPage } from './pages/admin/ReportsPage.tsx';
import { AdminProfilePage } from './pages/admin/AdminProfilePage.tsx';

function MainAppContent() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<string>(isAdmin ? 'admin_dashboard' : 'dashboard');

  // Sync default tab when user role changes
  useEffect(() => {
    if (user) {
      if (user.role === 'admin' && !activeTab.startsWith('admin_')) {
        setActiveTab('admin_dashboard');
      } else if (user.role === 'student' && activeTab.startsWith('admin_')) {
        setActiveTab('dashboard');
      }
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-600 font-mono">
            Loading Digital Library Portal...
          </span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isAdmin) {
      switch (activeTab) {
        case 'admin_dashboard':
          return <AdminDashboard setActiveTab={setActiveTab} />;
        case 'admin_books':
          return <BookManagementPage />;
        case 'admin_users':
          return <UserManagementPage />;
        case 'admin_issue_return':
          return <IssueReturnPage />;
        case 'admin_reservations':
          return <ReservationManagementPage />;
        case 'admin_resources':
          return <DigitalResourceManagementPage />;
        case 'admin_notifications':
          return <NotificationsManagementPage />;
        case 'admin_fines':
          return <FineManagementPage />;
        case 'admin_reports':
          return <ReportsPage />;
        case 'admin_profile':
          return <AdminProfilePage />;
        default:
          return <AdminDashboard setActiveTab={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboard setActiveTab={setActiveTab} />;
        case 'search':
          return <BookSearchPage />;
        case 'borrowings':
          return <MyBorrowingsPage />;
        case 'reservations':
          return <ReservationsPage />;
        case 'resources':
          return <DigitalResourcesPage />;
        case 'notifications':
          return <NotificationsPage />;
        case 'fines':
          return <FinesPage />;
        case 'profile':
          return <ProfilePage />;
        default:
          return <StudentDashboard setActiveTab={setActiveTab} />;
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-x-hidden min-w-0 bg-slate-50">{renderContent()}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
