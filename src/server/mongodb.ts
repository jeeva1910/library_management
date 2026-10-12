import mongoose from 'mongoose';
import {
  User,
  Book,
  BorrowingRecord,
  ReservationRecord,
  DigitalResource,
  NotificationItem,
  FineRecord,
  LibrarySettings,
} from '../types/index.js';

// --- Mongoose Schemas ---

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, required: true, enum: ['student', 'admin'], default: 'student' },
  studentId: { type: String },
  department: { type: String },
  phone: { type: String },
  avatarUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const bookSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true, index: true },
  author: { type: String, required: true, index: true },
  isbn: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, index: true },
  publisher: { type: String },
  publicationYear: { type: Number },
  totalCopies: { type: Number, default: 1 },
  availableCopies: { type: Number, default: 1 },
  description: { type: String },
  locationRack: { type: String },
  coverGradient: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const borrowingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  userEmail: { type: String },
  bookId: { type: String, required: true, index: true },
  bookTitle: { type: String },
  bookAuthor: { type: String },
  bookIsbn: { type: String },
  issueDate: { type: String, required: true },
  dueDate: { type: String, required: true },
  returnDate: { type: String },
  status: { type: String, required: true, enum: ['borrowed', 'returned', 'overdue', 'renewed'], default: 'borrowed' },
  renewalCount: { type: Number, default: 0 },
  fineAmount: { type: Number, default: 0 },
  isFinePaid: { type: Boolean, default: true },
});

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  bookId: { type: String, required: true, index: true },
  bookTitle: { type: String },
  bookAuthor: { type: String },
  reservationDate: { type: String, required: true },
  queuePosition: { type: Number, default: 1 },
  status: { type: String, required: true, enum: ['pending', 'fulfilled', 'cancelled', 'expired'], default: 'pending' },
});

const resourceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, required: true },
  resourceUrl: { type: String, required: true },
  accessType: { type: String, default: 'all' },
  fileType: { type: String, default: 'pdf' },
  fileSize: { type: String },
  author: { type: String },
  downloadCount: { type: Number, default: 0 },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'announcement' },
  isRead: { type: Boolean, default: false },
  createdAt: { type: String, default: () => new Date().toISOString() },
  linkTo: { type: String },
});

const fineSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  userName: { type: String },
  borrowingId: { type: String, required: true },
  bookTitle: { type: String },
  overdueDays: { type: Number, default: 0 },
  finePerDay: { type: Number, default: 0.5 },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'waived'], default: 'unpaid' },
  paidAt: { type: String },
  paymentMethod: { type: String },
  transactionRef: { type: String },
  createdAt: { type: String, default: () => new Date().toISOString() },
});

const settingsSchema = new mongoose.Schema({
  finePerDay: { type: Number, default: 0.5 },
  maxLoanDays: { type: Number, default: 14 },
  maxBooksPerStudent: { type: Number, default: 5 },
  maxRenewalAllowed: { type: Number, default: 2 },
  libraryName: { type: String, default: 'Apex University Digital Library' },
  contactEmail: { type: String, default: 'library@apex.edu' },
});

// --- Mongoose Models ---
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const BookModel = mongoose.models.Book || mongoose.model('Book', bookSchema);
export const BorrowingModel = mongoose.models.Borrowing || mongoose.model('Borrowing', borrowingSchema);
export const ReservationModel = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);
export const ResourceModel = mongoose.models.Resource || mongoose.model('Resource', resourceSchema);
export const NotificationModel = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export const FineModel = mongoose.models.Fine || mongoose.model('Fine', fineSchema);
export const SettingsModel = mongoose.models.Settings || mongoose.model('Settings', settingsSchema);

export interface MongoStatus {
  connected: boolean;
  uri: string;
  databaseName?: string;
  error?: string;
}

let mongoStatus: MongoStatus = {
  connected: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_library',
};

export async function initMongoDB(): Promise<MongoStatus> {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_library';
  mongoStatus.uri = uri;

  try {
    // Set 3 second timeout so local dev loads instantly if no MongoDB server is active
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });

    mongoStatus.connected = true;
    mongoStatus.databaseName = mongoose.connection.name;
    console.log(`Successfully connected to MongoDB database: ${mongoose.connection.name}`);

    // Check if initial seeding is needed for empty collections
    const bookCount = await BookModel.countDocuments();
    if (bookCount === 0) {
      console.log('MongoDB collection empty. Performing initial schema seeding...');
      // Seeding will be called from db.ts
    }
  } catch (err: any) {
    mongoStatus.connected = false;
    mongoStatus.error = err.message || 'Could not connect to MongoDB server';
    console.warn(`MongoDB Connection Notice: ${err.message}. Using high-speed JSON/In-Memory database layer.`);
  }

  return mongoStatus;
}

export function getMongoStatus(): MongoStatus {
  return {
    ...mongoStatus,
    connected: mongoose.connection.readyState === 1,
  };
}
