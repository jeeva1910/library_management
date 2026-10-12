export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  isActive: boolean;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  publicationYear: number;
  totalCopies: number;
  availableCopies: number;
  description: string;
  locationRack?: string;
  coverGradient?: string;
  createdAt: string;
}

export type BorrowStatus = 'borrowed' | 'returned' | 'overdue' | 'renewed';

export interface BorrowingRecord {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  bookIsbn?: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: BorrowStatus;
  renewalCount: number;
  fineAmount: number;
  isFinePaid: boolean;
}

export type ReservationStatus = 'pending' | 'fulfilled' | 'cancelled' | 'expired';

export interface ReservationRecord {
  id: string;
  userId: string;
  userName?: string;
  bookId: string;
  bookTitle?: string;
  bookAuthor?: string;
  reservationDate: string;
  queuePosition: number;
  status: ReservationStatus;
  notifiedAt?: string;
}

export type AccessType = 'all' | 'student' | 'faculty';

export interface DigitalResource {
  id: string;
  title: string;
  description: string;
  category: string;
  resourceUrl: string;
  accessType: AccessType;
  fileType: 'pdf' | 'epub' | 'link' | 'video' | 'article';
  fileSize?: string;
  author?: string;
  downloadCount: number;
  createdAt: string;
}

export type NotificationType = 'due_soon' | 'overdue' | 'reservation_ready' | 'renewal_approved' | 'renewal_rejected' | 'fine_added' | 'announcement';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  linkTo?: string;
}

export type FineStatus = 'unpaid' | 'paid' | 'waived';

export interface FineRecord {
  id: string;
  userId: string;
  userName?: string;
  borrowingId: string;
  bookTitle?: string;
  overdueDays: number;
  finePerDay: number;
  amount: number;
  status: FineStatus;
  paidAt?: string;
  paymentMethod?: string;
  transactionRef?: string;
  createdAt: string;
}

export interface LibrarySettings {
  finePerDay: number;
  maxLoanDays: number;
  maxBooksPerStudent: number;
  maxRenewalAllowed: number;
  libraryName: string;
  contactEmail: string;
}

export interface DashboardStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalStudents: number;
  overdueBooksCount: number;
  activeReservationsCount: number;
  totalFinesAmount: number;
  collectedFinesAmount: number;
  categoryBreakdown: { category: string; count: number }[];
  monthlyBorrowingActivity: { month: string; count: number }[];
  mostBorrowedBooks: { title: string; count: number; category: string }[];
}

export interface ReportSummary {
  period: string;
  totalTransactions: number;
  totalReturns: number;
  totalOverdues: number;
  totalFineRevenue: number;
  topCategories: { category: string; percentage: number }[];
  frequentBorrowers: { name: string; email: string; count: number }[];
}
