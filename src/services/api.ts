import {
  User,
  Book,
  BorrowingRecord,
  ReservationRecord,
  DigitalResource,
  NotificationItem,
  FineRecord,
  LibrarySettings,
  DashboardStats,
  ReportSummary,
} from '../types/index.js';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('dlms_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An API error occurred');
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password?: string) =>
    fetchJson<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: Partial<User> & { password?: string }) =>
    fetchJson<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () => fetchJson<{ user: User }>('/auth/me'),

  // Users
  getUsers: () => fetchJson<User[]>('/users'),
  updateUser: (id: string, updates: Partial<User>) =>
    fetchJson<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  // Books
  getBooks: (params?: { search?: string; category?: string; availableOnly?: boolean; sortBy?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.availableOnly) query.append('availableOnly', 'true');
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    return fetchJson<Book[]>(`/books?${query.toString()}`);
  },

  getBookById: (id: string) => fetchJson<Book>(`/books/${id}`),

  createBook: (bookData: Partial<Book>) =>
    fetchJson<Book>('/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    }),

  updateBook: (id: string, updates: Partial<Book>) =>
    fetchJson<Book>(`/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteBook: (id: string) =>
    fetchJson<{ message: string }>(`/books/${id}`, {
      method: 'DELETE',
    }),

  // Borrowings
  getMyBorrowings: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJson<BorrowingRecord[]>(`/borrowings/my${query}`);
  },

  getAllBorrowings: () => fetchJson<BorrowingRecord[]>('/borrowings/all'),

  issueBook: (userId: string, bookId: string, dueDate?: string) =>
    fetchJson<BorrowingRecord>('/borrowings/issue', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId, dueDate }),
    }),

  returnBook: (borrowingId: string) =>
    fetchJson<{ borrowing: BorrowingRecord; fine?: FineRecord }>(`/borrowings/${borrowingId}/return`, {
      method: 'POST',
    }),

  renewBook: (borrowingId: string) =>
    fetchJson<BorrowingRecord>(`/borrowings/${borrowingId}/renew`, {
      method: 'POST',
    }),

  // Reservations
  getMyReservations: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJson<ReservationRecord[]>(`/reservations/my${query}`);
  },

  getAllReservations: () => fetchJson<ReservationRecord[]>('/reservations/all'),

  reserveBook: (userId: string, bookId: string) =>
    fetchJson<ReservationRecord>('/reservations', {
      method: 'POST',
      body: JSON.stringify({ userId, bookId }),
    }),

  updateReservationStatus: (id: string, status: 'fulfilled' | 'cancelled') =>
    fetchJson<ReservationRecord>(`/reservations/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  // Digital Resources
  getResources: () => fetchJson<DigitalResource[]>('/resources'),

  createResource: (resData: Partial<DigitalResource>) =>
    fetchJson<DigitalResource>('/resources', {
      method: 'POST',
      body: JSON.stringify(resData),
    }),

  updateResource: (id: string, updates: Partial<DigitalResource>) =>
    fetchJson<DigitalResource>(`/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteResource: (id: string) =>
    fetchJson<{ message: string }>(`/resources/${id}`, {
      method: 'DELETE',
    }),

  recordResourceDownload: (id: string) =>
    fetchJson<{ message: string }>(`/resources/${id}/download`, {
      method: 'POST',
    }),

  // Notifications
  getNotifications: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJson<NotificationItem[]>(`/notifications${query}`);
  },

  markNotificationRead: (id: string) =>
    fetchJson<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PUT',
    }),

  markAllNotificationsRead: (userId?: string) =>
    fetchJson<{ success: boolean }>('/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),

  sendNotification: (userId: string, title: string, message: string, type?: string) =>
    fetchJson<NotificationItem>('/notifications', {
      method: 'POST',
      body: JSON.stringify({ userId, title, message, type }),
    }),

  // Fines
  getFines: (userId?: string) => {
    const query = userId ? `?userId=${userId}` : '';
    return fetchJson<FineRecord[]>(`/fines${query}`);
  },

  payFine: (fineId: string, paymentMethod: string, transactionRef?: string) =>
    fetchJson<FineRecord>(`/fines/${fineId}/pay`, {
      method: 'POST',
      body: JSON.stringify({ paymentMethod, transactionRef }),
    }),

  // Settings & Reports
  getSettings: () => fetchJson<LibrarySettings>('/settings'),
  updateSettings: (settings: Partial<LibrarySettings>) =>
    fetchJson<LibrarySettings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),

  getDashboardStats: () => fetchJson<DashboardStats>('/admin/dashboard'),
  getReports: () => fetchJson<ReportSummary>('/admin/reports'),
};
