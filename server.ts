import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.js';
import { getMongoStatus } from './src/server/mongodb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // API Router

  // --- MongoDB Connection Status ---
  app.get('/api/admin/mongodb-status', (_req, res) => {
    return res.json(getMongoStatus());
  });

  // --- Auth Routes ---
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (password && password.length < 4) {
      return res.status(401).json({ error: 'Password must be at least 4 characters' });
    }

    const token = `jwt_mock_token_${user.id}_${Date.now()}`;
    return res.json({ token, user });
  });

  app.post('/api/auth/register', (req, res) => {
    const { name, email, password, studentId, department, phone, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userRole = role === 'admin' ? 'admin' : 'student';
    const newUser = db.createUser({
      name,
      email,
      role: userRole,
      studentId: studentId || `STD${Math.floor(100000 + Math.random() * 900000)}`,
      department: department || 'General Studies',
      phone: phone || '',
      isActive: true,
    });

    const token = `jwt_mock_token_${newUser.id}_${Date.now()}`;
    return res.status(201).json({ token, user: newUser });
  });

  app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided' });
    }
    const parts = authHeader.split('_');
    if (parts.length >= 4) {
      const userId = `${parts[3]}_${parts[4]}`;
      const user = db.getUserById(userId);
      if (user) {
        return res.json({ user });
      }
    }
    const defaultUser = db.getUsers()[1];
    return res.json({ user: defaultUser });
  });

  // --- Users Routes (Admin) ---
  app.get('/api/users', (_req, res) => {
    const users = db.getUsers();
    return res.json(users);
  });

  app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const updated = db.updateUser(id, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });
    return res.json(updated);
  });

  // --- Books Routes ---
  app.get('/api/books', (req, res) => {
    const { search, category, availableOnly, sortBy } = req.query;
    let books = db.getBooks();

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      books = books.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string' && category !== 'All') {
      books = books.filter((b) => b.category.toLowerCase() === category.toLowerCase());
    }

    if (availableOnly === 'true') {
      books = books.filter((b) => b.availableCopies > 0);
    }

    if (sortBy && typeof sortBy === 'string') {
      if (sortBy === 'title') {
        books.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'author') {
        books.sort((a, b) => a.author.localeCompare(b.author));
      } else if (sortBy === 'year') {
        books.sort((a, b) => b.publicationYear - a.publicationYear);
      } else if (sortBy === 'availability') {
        books.sort((a, b) => b.availableCopies - a.availableCopies);
      }
    }

    return res.json(books);
  });

  app.get('/api/books/:id', (req, res) => {
    const book = db.getBookById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    return res.json(book);
  });

  app.post('/api/books', (req, res) => {
    const { title, author, isbn, category, publisher, publicationYear, totalCopies, description, locationRack } = req.body;
    if (!title || !author || !isbn || !category) {
      return res.status(400).json({ error: 'Title, author, ISBN, and category are required' });
    }

    const total = parseInt(totalCopies) || 1;
    const newBook = db.createBook({
      title,
      author,
      isbn,
      category,
      publisher: publisher || 'Academic Press',
      publicationYear: parseInt(publicationYear) || new Date().getFullYear(),
      totalCopies: total,
      availableCopies: total,
      description: description || '',
      locationRack: locationRack || 'GEN-A1-01',
    });

    return res.status(201).json(newBook);
  });

  app.put('/api/books/:id', (req, res) => {
    const updated = db.updateBook(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Book not found' });
    return res.json(updated);
  });

  app.delete('/api/books/:id', (req, res) => {
    const success = db.deleteBook(req.params.id);
    if (!success) return res.status(404).json({ error: 'Book not found' });
    return res.json({ message: 'Book deleted successfully' });
  });

  // --- Borrowings Routes ---
  app.get('/api/borrowings/my', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_std1';
    const borrowings = db.getBorrowingsByUser(userId);
    return res.json(borrowings);
  });

  app.get('/api/borrowings/all', (_req, res) => {
    const borrowings = db.getBorrowings();
    return res.json(borrowings);
  });

  app.post('/api/borrowings/issue', (req, res) => {
    const { userId, bookId, dueDate } = req.body;
    if (!userId || !bookId) {
      return res.status(400).json({ error: 'userId and bookId are required' });
    }

    try {
      const borrowing = db.issueBook(userId, bookId, dueDate);
      return res.status(201).json(borrowing);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to issue book' });
    }
  });

  app.post('/api/borrowings/:id/return', (req, res) => {
    try {
      const result = db.returnBook(req.params.id);
      return res.json(result);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Failed to process return' });
    }
  });

  app.post('/api/borrowings/:id/renew', (req, res) => {
    try {
      const updated = db.renewBook(req.params.id);
      return res.json(updated);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Renewal failed' });
    }
  });

  // --- Reservations Routes ---
  app.get('/api/reservations/my', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_std1';
    const reservations = db.getReservations().filter((r) => r.userId === userId);
    return res.json(reservations);
  });

  app.get('/api/reservations/all', (_req, res) => {
    const reservations = db.getReservations();
    return res.json(reservations);
  });

  app.post('/api/reservations', (req, res) => {
    const { userId, bookId } = req.body;
    if (!userId || !bookId) {
      return res.status(400).json({ error: 'userId and bookId are required' });
    }

    try {
      const reservation = db.reserveBook(userId, bookId);
      return res.status(201).json(reservation);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Reservation failed' });
    }
  });

  app.put('/api/reservations/:id', (req, res) => {
    const { status } = req.body;
    const updated = db.updateReservationStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Reservation not found' });
    return res.json(updated);
  });

  // --- Digital Resources Routes ---
  app.get('/api/resources', (_req, res) => {
    const resources = db.getResources();
    return res.json(resources);
  });

  app.post('/api/resources', (req, res) => {
    const { title, description, category, resourceUrl, accessType, fileType, author, fileSize } = req.body;
    if (!title || !category || !resourceUrl) {
      return res.status(400).json({ error: 'Title, category, and resourceUrl are required' });
    }

    const resource = db.createResource({
      title,
      description: description || '',
      category,
      resourceUrl,
      accessType: accessType || 'all',
      fileType: fileType || 'pdf',
      fileSize: fileSize || '2.5 MB',
      author: author || 'Academic Repository',
    });

    return res.status(201).json(resource);
  });

  app.put('/api/resources/:id', (req, res) => {
    const updated = db.updateResource(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Resource not found' });
    return res.json(updated);
  });

  app.delete('/api/resources/:id', (req, res) => {
    const success = db.deleteResource(req.params.id);
    if (!success) return res.status(404).json({ error: 'Resource not found' });
    return res.json({ message: 'Resource deleted' });
  });

  app.post('/api/resources/:id/download', (req, res) => {
    db.incrementResourceDownload(req.params.id);
    return res.json({ message: 'Download count recorded' });
  });

  // --- Notifications Routes ---
  app.get('/api/notifications', (req, res) => {
    const userId = (req.query.userId as string) || 'usr_std1';
    const notifications = db.getNotificationsByUser(userId);
    return res.json(notifications);
  });

  app.put('/api/notifications/:id/read', (req, res) => {
    const success = db.markNotificationAsRead(req.params.id);
    return res.json({ success });
  });

  app.post('/api/notifications/read-all', (req, res) => {
    const { userId } = req.body;
    db.markAllNotificationsAsRead(userId || 'usr_std1');
    return res.json({ success: true });
  });

  app.post('/api/notifications', (req, res) => {
    const { userId, title, message, type } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title, and message are required' });
    }

    const notif = db.createNotification({
      userId,
      title,
      message,
      type: type || 'announcement',
      isRead: false,
    });

    return res.status(201).json(notif);
  });

  // --- Fines Routes ---
  app.get('/api/fines', (req, res) => {
    const { userId } = req.query;
    if (userId && typeof userId === 'string') {
      return res.json(db.getFinesByUser(userId));
    }
    return res.json(db.getFines());
  });

  app.post('/api/fines/:id/pay', (req, res) => {
    const { paymentMethod, transactionRef } = req.body;
    try {
      const paidFine = db.payFine(
        req.params.id,
        paymentMethod || 'Credit Card / Digital Wallet',
        transactionRef || `PAY-${Math.floor(100000 + Math.random() * 900000)}`
      );
      return res.json(paidFine);
    } catch (err: any) {
      return res.status(400).json({ error: err.message || 'Payment failed' });
    }
  });

  // --- Settings & Admin Reports ---
  app.get('/api/settings', (_req, res) => {
    return res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    const updated = db.updateSettings(req.body);
    return res.json(updated);
  });

  app.get('/api/admin/dashboard', (_req, res) => {
    const stats = db.getDashboardStats();
    return res.json(stats);
  });

  app.get('/api/admin/reports', (_req, res) => {
    const borrowings = db.getBorrowings();
    const fines = db.getFines();

    const report = {
      period: 'Academic Semester Fall 2026',
      totalTransactions: borrowings.length,
      totalReturns: borrowings.filter((b) => b.status === 'returned').length,
      totalOverdues: borrowings.filter((b) => b.status === 'overdue').length,
      totalFineRevenue: fines.filter((f) => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0),
      topCategories: [
        { category: 'Computer Science', percentage: 38 },
        { category: 'Artificial Intelligence', percentage: 24 },
        { category: 'Mathematics', percentage: 18 },
        { category: 'Physics', percentage: 12 },
        { category: 'Literature', percentage: 8 },
      ],
      frequentBorrowers: [
        { name: 'Alex Johnson', email: 'alex.johnson@student.edu', count: 8 },
        { name: 'Maya Lin', email: 'maya.lin@student.edu', count: 6 },
        { name: 'David Chen', email: 'david.chen@student.edu', count: 5 },
      ],
    };

    return res.json(report);
  });

  // Vite Integration in Development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Digital Library Management System running at http://localhost:${PORT}`);
  });
}

startServer();
