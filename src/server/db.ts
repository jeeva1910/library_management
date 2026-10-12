import fs from 'fs';
import path from 'path';
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
} from '../types/index.js';
import {
  initMongoDB,
  getMongoStatus,
  UserModel,
  BookModel,
  BorrowingModel,
  ReservationModel,
  ResourceModel,
  NotificationModel,
  FineModel,
  SettingsModel,
} from './mongodb.js';

const DATA_FILE = path.join(process.cwd(), 'library_data.json');

export interface DatabaseSchema {
  users: User[];
  books: Book[];
  borrowings: BorrowingRecord[];
  reservations: ReservationRecord[];
  resources: DigitalResource[];
  notifications: NotificationItem[];
  fines: FineRecord[];
  settings: LibrarySettings;
}

const INITIAL_DATA: DatabaseSchema = {
  settings: {
    finePerDay: 0.50,
    maxLoanDays: 14,
    maxBooksPerStudent: 5,
    maxRenewalAllowed: 2,
    libraryName: 'Apex University Digital Library',
    contactEmail: 'library@apex.edu',
  },
  users: [
    {
      id: 'usr_admin1',
      name: 'Dr. Eleanor Vance',
      email: 'admin@library.edu',
      role: 'admin',
      department: 'Library Services & Archives',
      phone: '+1 (555) 019-2831',
      createdAt: '2025-01-10T08:00:00Z',
      isActive: true,
    },
    {
      id: 'usr_std1',
      name: 'Alex Johnson',
      email: 'alex.johnson@student.edu',
      role: 'student',
      studentId: 'CS20240891',
      department: 'Computer Science & Engineering',
      phone: '+1 (555) 432-8901',
      createdAt: '2025-08-20T10:30:00Z',
      isActive: true,
    },
    {
      id: 'usr_std2',
      name: 'Maya Lin',
      email: 'maya.lin@student.edu',
      role: 'student',
      studentId: 'BE20240122',
      department: 'Bioengineering',
      phone: '+1 (555) 781-3342',
      createdAt: '2025-08-22T11:15:00Z',
      isActive: true,
    },
    {
      id: 'usr_std3',
      name: 'David Chen',
      email: 'david.chen@student.edu',
      role: 'student',
      studentId: 'ME20240455',
      department: 'Mechanical Engineering',
      phone: '+1 (555) 902-1188',
      createdAt: '2025-09-01T14:20:00Z',
      isActive: true,
    },
  ],
  books: [
    {
      id: 'bk_001',
      title: 'Introduction to Algorithms (4th Edition)',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      isbn: '978-0262046305',
      category: 'Computer Science',
      publisher: 'MIT Press',
      publicationYear: 2022,
      totalCopies: 6,
      availableCopies: 3,
      description: 'Comprehensive modern textbook covering a wide range of algorithms in depth, yet making their design and analysis accessible to all levels of readers.',
      locationRack: 'CS-A1-04',
      coverGradient: 'from-blue-700 via-indigo-800 to-slate-900',
      createdAt: '2025-01-15T09:00:00Z',
    },
    {
      id: 'bk_002',
      title: 'Deep Learning & Neural Networks',
      author: 'Ian Goodfellow, Yoshua Bengio',
      isbn: '978-0262035613',
      category: 'Artificial Intelligence',
      publisher: 'MIT Press',
      publicationYear: 2021,
      totalCopies: 5,
      availableCopies: 1,
      description: 'An essential textbook on deep learning covering mathematical fundamentals, deep network architectures, convolutional nets, and generative models.',
      locationRack: 'AI-B2-12',
      coverGradient: 'from-cyan-700 via-blue-900 to-slate-900',
      createdAt: '2025-01-18T10:00:00Z',
    },
    {
      id: 'bk_003',
      title: 'Principles of Quantum Mechanics',
      author: 'R. Shankar',
      isbn: '978-0306447908',
      category: 'Physics',
      publisher: 'Springer',
      publicationYear: 2020,
      totalCopies: 4,
      availableCopies: 2,
      description: 'A mathematical introduction to quantum mechanical principles, Dirac notation, path integrals, and quantum spin dynamics.',
      locationRack: 'PHY-C3-08',
      coverGradient: 'from-indigo-900 via-purple-900 to-slate-900',
      createdAt: '2025-01-20T11:00:00Z',
    },
    {
      id: 'bk_004',
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      isbn: '978-0132350884',
      category: 'Computer Science',
      publisher: 'Prentice Hall',
      publicationYear: 2020,
      totalCopies: 4,
      availableCopies: 0,
      description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Learn how to write clean, refactored code.',
      locationRack: 'CS-A2-01',
      coverGradient: 'from-emerald-800 via-teal-900 to-slate-900',
      createdAt: '2025-01-22T13:30:00Z',
    },
    {
      id: 'bk_005',
      title: 'Principles of Modern Macroeconomics',
      author: 'N. Gregory Mankiw',
      isbn: '978-0357722961',
      category: 'Economics & Business',
      publisher: 'Cengage Learning',
      publicationYear: 2023,
      totalCopies: 7,
      availableCopies: 5,
      description: 'An engaging exploration of macroeconomic theory, monetary policy, international finance, and market equilibrium.',
      locationRack: 'ECO-D1-15',
      coverGradient: 'from-amber-700 via-yellow-900 to-slate-900',
      createdAt: '2025-01-25T08:45:00Z',
    },
    {
      id: 'bk_006',
      title: 'Molecular Biology of the Cell',
      author: 'Bruce Alberts, Rebecca Heald',
      isbn: '978-0393884821',
      category: 'Biotechnology',
      publisher: 'W. W. Norton & Company',
      publicationYear: 2022,
      totalCopies: 5,
      availableCopies: 4,
      description: 'Definitive cellular biology textbook examining molecular mechanisms, gene regulation, cell signaling, and organelle structures.',
      locationRack: 'BIO-E2-03',
      coverGradient: 'from-teal-800 via-emerald-950 to-slate-900',
      createdAt: '2025-02-01T10:00:00Z',
    },
    {
      id: 'bk_007',
      title: 'Linear Algebra and Its Applications',
      author: 'David C. Lay, Steven R. Lay',
      isbn: '978-0135882801',
      category: 'Mathematics',
      publisher: 'Pearson',
      publicationYear: 2021,
      totalCopies: 8,
      availableCopies: 6,
      description: 'Fundamental linear algebra covering vector spaces, matrix transformations, eigenvalues, orthogonal projections, and SVD decomposition.',
      locationRack: 'MATH-A3-11',
      coverGradient: 'from-sky-800 via-blue-950 to-slate-900',
      createdAt: '2025-02-05T12:00:00Z',
    },
    {
      id: 'bk_008',
      title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
      author: 'Erich Gamma, Richard Helm, Ralph Johnson',
      isbn: '978-0201633610',
      category: 'Computer Science',
      publisher: 'Addison-Wesley',
      publicationYear: 2019,
      totalCopies: 3,
      availableCopies: 2,
      description: 'Catalog of 23 software design patterns representing solutions to recurring engineering problems in object-oriented design.',
      locationRack: 'CS-A1-09',
      coverGradient: 'from-violet-800 via-indigo-950 to-slate-900',
      createdAt: '2025-02-10T14:10:00Z',
    },
    {
      id: 'bk_009',
      title: 'Data Science for Business',
      author: 'Foster Provost, Tom Fawcett',
      isbn: '978-1449361327',
      category: 'Data Science',
      publisher: 'OReilly Media',
      publicationYear: 2020,
      totalCopies: 5,
      availableCopies: 4,
      description: 'Fundamental principles of data mining and data-analytic thinking for extracting business value from enterprise data.',
      locationRack: 'DS-F1-02',
      coverGradient: 'from-blue-800 via-cyan-950 to-slate-900',
      createdAt: '2025-02-12T09:30:00Z',
    },
    {
      id: 'bk_010',
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      category: 'Literature',
      publisher: 'Scribner',
      publicationYear: 2018,
      totalCopies: 10,
      availableCopies: 8,
      description: 'A classic tale of ambition, obsession, wealth, and tragedy in Jazz Age America.',
      locationRack: 'LIT-G2-20',
      coverGradient: 'from-rose-800 via-pink-950 to-slate-900',
      createdAt: '2025-02-15T16:00:00Z',
    },
    {
      id: 'bk_011',
      title: 'Thermodynamics: An Engineering Approach',
      author: 'Yunus A. Cengel, Michael A. Boles',
      isbn: '978-1260048667',
      category: 'Engineering',
      publisher: 'McGraw Hill',
      publicationYear: 2021,
      totalCopies: 4,
      availableCopies: 3,
      description: 'Covers classical energy principles, enthalpy, entropy, thermodynamic cycles, and energy transformation in engineering systems.',
      locationRack: 'ENG-H1-05',
      coverGradient: 'from-orange-800 via-amber-950 to-slate-900',
      createdAt: '2025-02-18T11:40:00Z',
    },
    {
      id: 'bk_012',
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      isbn: '978-0134610993',
      category: 'Artificial Intelligence',
      publisher: 'Pearson',
      publicationYear: 2021,
      totalCopies: 6,
      availableCopies: 4,
      description: 'The standard textbook in artificial intelligence, covering search algorithms, knowledge representation, probabilistic reasoning, and multi-agent systems.',
      locationRack: 'AI-B1-01',
      coverGradient: 'from-blue-900 via-indigo-950 to-slate-900',
      createdAt: '2025-02-20T08:20:00Z',
    },
  ],
  borrowings: [
    {
      id: 'bor_101',
      userId: 'usr_std1',
      userName: 'Alex Johnson',
      userEmail: 'alex.johnson@student.edu',
      bookId: 'bk_004',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookAuthor: 'Robert C. Martin',
      bookIsbn: '978-0132350884',
      issueDate: '2026-09-15T10:00:00Z',
      dueDate: '2026-09-29T10:00:00Z',
      status: 'overdue',
      renewalCount: 0,
      fineAmount: 6.00,
      isFinePaid: false,
    },
    {
      id: 'bor_102',
      userId: 'usr_std1',
      userName: 'Alex Johnson',
      userEmail: 'alex.johnson@student.edu',
      bookId: 'bk_001',
      bookTitle: 'Introduction to Algorithms (4th Edition)',
      bookAuthor: 'Thomas H. Cormen, Charles E. Leiserson',
      bookIsbn: '978-0262046305',
      issueDate: '2026-10-01T14:30:00Z',
      dueDate: '2026-10-15T14:30:00Z',
      status: 'borrowed',
      renewalCount: 0,
      fineAmount: 0,
      isFinePaid: true,
    },
    {
      id: 'bor_103',
      userId: 'usr_std2',
      userName: 'Maya Lin',
      userEmail: 'maya.lin@student.edu',
      bookId: 'bk_002',
      bookTitle: 'Deep Learning & Neural Networks',
      bookAuthor: 'Ian Goodfellow, Yoshua Bengio',
      bookIsbn: '978-0262035613',
      issueDate: '2026-10-05T09:15:00Z',
      dueDate: '2026-10-19T09:15:00Z',
      status: 'borrowed',
      renewalCount: 0,
      fineAmount: 0,
      isFinePaid: true,
    },
    {
      id: 'bor_104',
      userId: 'usr_std3',
      userName: 'David Chen',
      userEmail: 'david.chen@student.edu',
      bookId: 'bk_007',
      bookTitle: 'Linear Algebra and Its Applications',
      bookAuthor: 'David C. Lay, Steven R. Lay',
      bookIsbn: '978-0135882801',
      issueDate: '2026-09-01T11:00:00Z',
      dueDate: '2026-09-15T11:00:00Z',
      returnDate: '2026-09-14T15:20:00Z',
      status: 'returned',
      renewalCount: 1,
      fineAmount: 0,
      isFinePaid: true,
    },
  ],
  reservations: [
    {
      id: 'res_201',
      userId: 'usr_std3',
      userName: 'David Chen',
      bookId: 'bk_004',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookAuthor: 'Robert C. Martin',
      reservationDate: '2026-10-02T16:00:00Z',
      queuePosition: 1,
      status: 'pending',
    },
  ],
  resources: [
    {
      id: 'res_301',
      title: 'Advanced Data Structures & Graph Algorithms Lecture Notes',
      description: 'Complete lecture slides and problem sets on red-black trees, segment trees, max-flow min-cut, and dynamic programming.',
      category: 'Computer Science',
      resourceUrl: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
      accessType: 'all',
      fileType: 'pdf',
      fileSize: '4.8 MB',
      author: 'Dept. of CS, MIT',
      downloadCount: 142,
      createdAt: '2025-02-01T09:00:00Z',
    },
    {
      id: 'res_302',
      title: 'Quantum Computing Foundations & Qiskit Laboratory Guide',
      description: 'Hands-on tutorial guide for quantum circuit simulation, qubit superposition, and Grover search algorithm.',
      category: 'Physics',
      resourceUrl: 'https://qiskit.org/documentation/',
      accessType: 'student',
      fileType: 'pdf',
      fileSize: '8.2 MB',
      author: 'IBM Quantum Learning',
      downloadCount: 89,
      createdAt: '2025-02-10T14:20:00Z',
    },
    {
      id: 'res_303',
      title: 'Gene Editing & CRISPR-Cas9 Research Compendium',
      description: 'Peer-reviewed articles and protocols for sgRNA design, off-target analysis, and viral vector transfection.',
      category: 'Biotechnology',
      resourceUrl: 'https://www.ncbi.nlm.nih.gov/pmc/',
      accessType: 'student',
      fileType: 'article',
      fileSize: '3.1 MB',
      author: 'Journal of Molecular Biology',
      downloadCount: 65,
      createdAt: '2025-02-18T10:15:00Z',
    },
    {
      id: 'res_304',
      title: 'Econometric Analysis & Financial Time Series Dataset',
      description: 'CSV datasets and R scripts for ARIMA forecasting, GARCH volatility modeling, and macro-financial regressions.',
      category: 'Economics & Business',
      resourceUrl: 'https://fred.stlouisfed.org/',
      accessType: 'all',
      fileType: 'link',
      fileSize: '12.5 MB',
      author: 'Federal Reserve Bank Data',
      downloadCount: 110,
      createdAt: '2025-02-25T11:00:00Z',
    },
    {
      id: 'res_305',
      title: 'Software Architecture & Microservices Whitepaper',
      description: 'Best practices for API gateway design, event-driven architecture, Saga pattern, and containerization with Docker.',
      category: 'Computer Science',
      resourceUrl: 'https://martinfowler.com/articles/microservices.html',
      accessType: 'faculty',
      fileType: 'pdf',
      fileSize: '2.4 MB',
      author: 'Martin Fowler ThoughtWorks',
      downloadCount: 34,
      createdAt: '2025-03-01T08:30:00Z',
    },
  ],
  notifications: [
    {
      id: 'notif_401',
      userId: 'usr_std1',
      title: 'Overdue Book Alert',
      message: 'Your borrowing of "Clean Code" was due on Sep 29, 2026. Fine accrued: $6.00. Please return the book as soon as possible.',
      type: 'overdue',
      isRead: false,
      createdAt: '2026-09-30T00:00:00Z',
      linkTo: '/fines',
    },
    {
      id: 'notif_402',
      userId: 'usr_std1',
      title: 'Book Due Soon',
      message: 'Your borrowing of "Introduction to Algorithms (4th Edition)" is due in 4 days (Oct 15, 2026). You can request a renewal if eligible.',
      type: 'due_soon',
      isRead: false,
      createdAt: '2026-10-10T08:00:00Z',
      linkTo: '/borrowings',
    },
    {
      id: 'notif_403',
      userId: 'usr_std3',
      title: 'Reservation Confirmed',
      message: 'You are position #1 in queue for "Clean Code: A Handbook of Agile Software Craftsmanship". We will notify you when a copy is returned.',
      type: 'reservation_ready',
      isRead: true,
      createdAt: '2026-10-02T16:01:00Z',
      linkTo: '/reservations',
    },
  ],
  fines: [
    {
      id: 'fine_501',
      userId: 'usr_std1',
      userName: 'Alex Johnson',
      borrowingId: 'bor_101',
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      overdueDays: 12,
      finePerDay: 0.50,
      amount: 6.00,
      status: 'unpaid',
      createdAt: '2026-09-30T00:00:00Z',
    },
  ],
};

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    // Asynchronously attempt MongoDB initialization
    initMongoDB().then((status) => {
      if (status.connected) {
        this.seedMongoIfNeeded();
      }
    });
  }

  private async seedMongoIfNeeded() {
    try {
      const bookCount = await BookModel.countDocuments();
      if (bookCount === 0) {
        console.log('Seeding MongoDB collections with library dataset...');
        await UserModel.insertMany(INITIAL_DATA.users);
        await BookModel.insertMany(INITIAL_DATA.books);
        await BorrowingModel.insertMany(INITIAL_DATA.borrowings);
        await ReservationModel.insertMany(INITIAL_DATA.reservations);
        await ResourceModel.insertMany(INITIAL_DATA.resources);
        await NotificationModel.insertMany(INITIAL_DATA.notifications);
        await FineModel.insertMany(INITIAL_DATA.fines);
        await SettingsModel.create(INITIAL_DATA.settings);
        console.log('MongoDB successfully seeded!');
      }
    } catch (e) {
      console.error('Error seeding MongoDB collections:', e);
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to load existing library_data.json, reinitializing.', e);
    }
    this.save(INITIAL_DATA);
    return INITIAL_DATA;
  }

  public save(data?: DatabaseSchema) {
    if (data) this.data = data;
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save library_data.json', e);
    }
  }

  public getSettings(): LibrarySettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<LibrarySettings>): LibrarySettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.save();

    // Async sync to MongoDB if connected
    if (getMongoStatus().connected) {
      SettingsModel.updateOne({}, this.data.settings, { upsert: true }).catch(() => {});
    }

    return this.data.settings;
  }

  // Users
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const newUser: User = {
      ...user,
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.users.push(newUser);
    this.save();

    if (getMongoStatus().connected) {
      UserModel.create(newUser).catch(() => {});
    }

    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.data.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.data.users[idx] = { ...this.data.users[idx], ...updates };
    this.save();

    if (getMongoStatus().connected) {
      UserModel.updateOne({ id }, updates).catch(() => {});
    }

    return this.data.users[idx];
  }

  // Books
  public getBooks(): Book[] {
    return this.data.books;
  }

  public getBookById(id: string): Book | undefined {
    return this.data.books.find((b) => b.id === id);
  }

  public createBook(book: Omit<Book, 'id' | 'createdAt'>): Book {
    const gradients = [
      'from-blue-700 via-indigo-800 to-slate-900',
      'from-cyan-700 via-blue-900 to-slate-900',
      'from-emerald-800 via-teal-900 to-slate-900',
      'from-indigo-900 via-purple-900 to-slate-900',
      'from-amber-700 via-yellow-900 to-slate-900',
      'from-teal-800 via-emerald-950 to-slate-900',
    ];
    const coverGradient = book.coverGradient || gradients[Math.floor(Math.random() * gradients.length)];
    const newBook: Book = {
      ...book,
      id: `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      coverGradient,
      createdAt: new Date().toISOString(),
    };
    this.data.books.push(newBook);
    this.save();

    if (getMongoStatus().connected) {
      BookModel.create(newBook).catch(() => {});
    }

    return newBook;
  }

  public updateBook(id: string, updates: Partial<Book>): Book | undefined {
    const idx = this.data.books.findIndex((b) => b.id === id);
    if (idx === -1) return undefined;
    this.data.books[idx] = { ...this.data.books[idx], ...updates };
    this.save();

    if (getMongoStatus().connected) {
      BookModel.updateOne({ id }, updates).catch(() => {});
    }

    return this.data.books[idx];
  }

  public deleteBook(id: string): boolean {
    const initialLen = this.data.books.length;
    this.data.books = this.data.books.filter((b) => b.id !== id);
    if (this.data.books.length !== initialLen) {
      this.save();
      if (getMongoStatus().connected) {
        BookModel.deleteOne({ id }).catch(() => {});
      }
      return true;
    }
    return false;
  }

  // Borrowings
  public getBorrowings(): BorrowingRecord[] {
    return this.data.borrowings;
  }

  public getBorrowingById(id: string): BorrowingRecord | undefined {
    return this.data.borrowings.find((b) => b.id === id);
  }

  public getBorrowingsByUser(userId: string): BorrowingRecord[] {
    return this.data.borrowings.filter((b) => b.userId === userId);
  }

  public issueBook(userId: string, bookId: string, customDueDate?: string): BorrowingRecord {
    const user = this.getUserById(userId);
    const book = this.getBookById(bookId);
    if (!user || !book) throw new Error('User or book not found');
    if (book.availableCopies <= 0) throw new Error('No available copies of this book');

    book.availableCopies -= 1;

    const issueDate = new Date();
    const dueDate = customDueDate
      ? new Date(customDueDate)
      : new Date(issueDate.getTime() + this.data.settings.maxLoanDays * 24 * 60 * 60 * 1000);

    const newBorrowing: BorrowingRecord = {
      id: `bor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      bookIsbn: book.isbn,
      issueDate: issueDate.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'borrowed',
      renewalCount: 0,
      fineAmount: 0,
      isFinePaid: true,
    };

    this.data.borrowings.push(newBorrowing);

    this.createNotification({
      userId: user.id,
      title: 'Book Issued Successfully',
      message: `You have borrowed "${book.title}". Due date: ${dueDate.toLocaleDateString()}.`,
      type: 'announcement',
      isRead: false,
      linkTo: '/borrowings',
    });

    this.save();

    if (getMongoStatus().connected) {
      BorrowingModel.create(newBorrowing).catch(() => {});
      BookModel.updateOne({ id: book.id }, { availableCopies: book.availableCopies }).catch(() => {});
    }

    return newBorrowing;
  }

  public returnBook(borrowingId: string): { borrowing: BorrowingRecord; fine?: FineRecord } {
    const borrowing = this.getBorrowingById(borrowingId);
    if (!borrowing) throw new Error('Borrowing record not found');
    if (borrowing.status === 'returned') throw new Error('Book is already returned');

    const book = this.getBookById(borrowing.bookId);
    if (book) {
      book.availableCopies += 1;
      
      const pendingRes = this.data.reservations
        .filter((r) => r.bookId === book.id && r.status === 'pending')
        .sort((a, b) => a.queuePosition - b.queuePosition)[0];

      if (pendingRes) {
        this.createNotification({
          userId: pendingRes.userId,
          title: 'Reserved Book Available!',
          message: `A copy of "${book.title}" is now available at the library desk. Please pick it up within 48 hours.`,
          type: 'reservation_ready',
          isRead: false,
          linkTo: '/reservations',
        });
      }
    }

    const returnDate = new Date();
    borrowing.returnDate = returnDate.toISOString();
    borrowing.status = 'returned';

    const due = new Date(borrowing.dueDate);
    let fineRecord: FineRecord | undefined = undefined;

    if (returnDate > due) {
      const diffMs = returnDate.getTime() - due.getTime();
      const overdueDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (overdueDays > 0) {
        const fineAmount = overdueDays * this.data.settings.finePerDay;
        borrowing.fineAmount = fineAmount;
        borrowing.isFinePaid = false;

        fineRecord = {
          id: `fine_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          userId: borrowing.userId,
          userName: borrowing.userName,
          borrowingId: borrowing.id,
          bookTitle: borrowing.bookTitle,
          overdueDays,
          finePerDay: this.data.settings.finePerDay,
          amount: fineAmount,
          status: 'unpaid',
          createdAt: new Date().toISOString(),
        };

        this.data.fines.push(fineRecord);

        this.createNotification({
          userId: borrowing.userId,
          title: 'Fine Generated for Overdue Book',
          message: `A fine of $${fineAmount.toFixed(2)} (${overdueDays} days overdue) was generated upon returning "${borrowing.bookTitle}".`,
          type: 'fine_added',
          isRead: false,
          linkTo: '/fines',
        });

        if (getMongoStatus().connected) {
          FineModel.create(fineRecord).catch(() => {});
        }
      }
    }

    this.save();

    if (getMongoStatus().connected) {
      BorrowingModel.updateOne({ id: borrowing.id }, borrowing).catch(() => {});
      if (book) {
        BookModel.updateOne({ id: book.id }, { availableCopies: book.availableCopies }).catch(() => {});
      }
    }

    return { borrowing, fine: fineRecord };
  }

  public renewBook(borrowingId: string): BorrowingRecord {
    const borrowing = this.getBorrowingById(borrowingId);
    if (!borrowing) throw new Error('Borrowing record not found');
    if (borrowing.status !== 'borrowed' && borrowing.status !== 'renewed') {
      throw new Error('Only active borrowings can be renewed');
    }
    if (borrowing.renewalCount >= this.data.settings.maxRenewalAllowed) {
      throw new Error(`Maximum renewal limit (${this.data.settings.maxRenewalAllowed}) reached for this book.`);
    }

    if (new Date() > new Date(borrowing.dueDate)) {
      throw new Error('Overdue books cannot be renewed online. Please visit the library desk to settle fines.');
    }

    const currentDue = new Date(borrowing.dueDate);
    const newDue = new Date(currentDue.getTime() + this.data.settings.maxLoanDays * 24 * 60 * 60 * 1000);

    borrowing.dueDate = newDue.toISOString();
    borrowing.renewalCount += 1;
    borrowing.status = 'renewed';

    this.createNotification({
      userId: borrowing.userId,
      title: 'Book Renewal Approved',
      message: `Your borrowing of "${borrowing.bookTitle}" has been extended to ${newDue.toLocaleDateString()}.`,
      type: 'renewal_approved',
      isRead: false,
      linkTo: '/borrowings',
    });

    this.save();

    if (getMongoStatus().connected) {
      BorrowingModel.updateOne({ id: borrowing.id }, borrowing).catch(() => {});
    }

    return borrowing;
  }

  // Reservations
  public getReservations(): ReservationRecord[] {
    return this.data.reservations;
  }

  public reserveBook(userId: string, bookId: string): ReservationRecord {
    const user = this.getUserById(userId);
    const book = this.getBookById(bookId);
    if (!user || !book) throw new Error('User or book not found');

    if (book.availableCopies > 0) {
      throw new Error('This book is currently available for direct borrowing!');
    }

    const existing = this.data.reservations.find(
      (r) => r.userId === userId && r.bookId === bookId && r.status === 'pending'
    );
    if (existing) {
      throw new Error('You already have an active reservation request for this book.');
    }

    const activeBookReservations = this.data.reservations.filter(
      (r) => r.bookId === bookId && r.status === 'pending'
    );
    const queuePosition = activeBookReservations.length + 1;

    const newReservation: ReservationRecord = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      userName: user.name,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.author,
      reservationDate: new Date().toISOString(),
      queuePosition,
      status: 'pending',
    };

    this.data.reservations.push(newReservation);

    this.createNotification({
      userId: user.id,
      title: 'Book Reservation Confirmed',
      message: `Reserved "${book.title}". You are queue position #${queuePosition}.`,
      type: 'reservation_ready',
      isRead: false,
      linkTo: '/reservations',
    });

    this.save();

    if (getMongoStatus().connected) {
      ReservationModel.create(newReservation).catch(() => {});
    }

    return newReservation;
  }

  public updateReservationStatus(id: string, status: 'fulfilled' | 'cancelled'): ReservationRecord | undefined {
    const res = this.data.reservations.find((r) => r.id === id);
    if (!res) return undefined;
    res.status = status;
    this.save();

    if (getMongoStatus().connected) {
      ReservationModel.updateOne({ id }, { status }).catch(() => {});
    }

    return res;
  }

  // Digital Resources
  public getResources(): DigitalResource[] {
    return this.data.resources;
  }

  public createResource(resource: Omit<DigitalResource, 'id' | 'downloadCount' | 'createdAt'>): DigitalResource {
    const newRes: DigitalResource = {
      ...resource,
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.data.resources.push(newRes);
    this.save();

    if (getMongoStatus().connected) {
      ResourceModel.create(newRes).catch(() => {});
    }

    return newRes;
  }

  public updateResource(id: string, updates: Partial<DigitalResource>): DigitalResource | undefined {
    const idx = this.data.resources.findIndex((r) => r.id === id);
    if (idx === -1) return undefined;
    this.data.resources[idx] = { ...this.data.resources[idx], ...updates };
    this.save();

    if (getMongoStatus().connected) {
      ResourceModel.updateOne({ id }, updates).catch(() => {});
    }

    return this.data.resources[idx];
  }

  public deleteResource(id: string): boolean {
    const initialLen = this.data.resources.length;
    this.data.resources = this.data.resources.filter((r) => r.id !== id);
    if (this.data.resources.length !== initialLen) {
      this.save();
      if (getMongoStatus().connected) {
        ResourceModel.deleteOne({ id }).catch(() => {});
      }
      return true;
    }
    return false;
  }

  public incrementResourceDownload(id: string): void {
    const res = this.data.resources.find((r) => r.id === id);
    if (res) {
      res.downloadCount += 1;
      this.save();
      if (getMongoStatus().connected) {
        ResourceModel.updateOne({ id }, { $inc: { downloadCount: 1 } }).catch(() => {});
      }
    }
  }

  // Notifications
  public getNotificationsByUser(userId: string): NotificationItem[] {
    return this.data.notifications.filter((n) => n.userId === userId).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public createNotification(notif: Omit<NotificationItem, 'id' | 'createdAt'>): NotificationItem {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.notifications.push(newNotif);
    this.save();

    if (getMongoStatus().connected) {
      NotificationModel.create(newNotif).catch(() => {});
    }

    return newNotif;
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.data.notifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      this.save();

      if (getMongoStatus().connected) {
        NotificationModel.updateOne({ id }, { isRead: true }).catch(() => {});
      }

      return true;
    }
    return false;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach((n) => {
      if (n.userId === userId) n.isRead = true;
    });
    this.save();

    if (getMongoStatus().connected) {
      NotificationModel.updateMany({ userId }, { isRead: true }).catch(() => {});
    }
  }

  // Fines
  public getFines(): FineRecord[] {
    return this.data.fines;
  }

  public getFinesByUser(userId: string): FineRecord[] {
    return this.data.fines.filter((f) => f.userId === userId);
  }

  public payFine(fineId: string, paymentMethod: string, transactionRef: string): FineRecord {
    const fine = this.data.fines.find((f) => f.id === fineId);
    if (!fine) throw new Error('Fine record not found');
    fine.status = 'paid';
    fine.paidAt = new Date().toISOString();
    fine.paymentMethod = paymentMethod;
    fine.transactionRef = transactionRef;

    const borrowing = this.getBorrowingById(fine.borrowingId);
    if (borrowing) {
      borrowing.isFinePaid = true;
    }

    this.createNotification({
      userId: fine.userId,
      title: 'Fine Payment Receipt',
      message: `Fine of $${fine.amount.toFixed(2)} for "${fine.bookTitle}" has been successfully settled (Ref: ${transactionRef}).`,
      type: 'announcement',
      isRead: false,
      linkTo: '/fines',
    });

    this.save();

    if (getMongoStatus().connected) {
      FineModel.updateOne({ id: fineId }, fine).catch(() => {});
      if (borrowing) {
        BorrowingModel.updateOne({ id: borrowing.id }, { isFinePaid: true }).catch(() => {});
      }
    }

    return fine;
  }

  // Dashboard Stats
  public getDashboardStats(): DashboardStats {
    const totalBooks = this.data.books.reduce((acc, b) => acc + b.totalCopies, 0);
    const availableBooks = this.data.books.reduce((acc, b) => acc + b.availableCopies, 0);
    const borrowedBooks = this.data.borrowings.filter((b) => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue').length;
    const totalStudents = this.data.users.filter((u) => u.role === 'student').length;
    
    const now = new Date();
    const overdueBooksCount = this.data.borrowings.filter((b) => {
      if (b.status === 'returned') return false;
      return new Date(b.dueDate) < now;
    }).length;

    const activeReservationsCount = this.data.reservations.filter((r) => r.status === 'pending').length;

    const totalFinesAmount = this.data.fines.reduce((acc, f) => acc + f.amount, 0);
    const collectedFinesAmount = this.data.fines.filter((f) => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0);

    const categoryMap: Record<string, number> = {};
    this.data.books.forEach((b) => {
      categoryMap[b.category] = (categoryMap[b.category] || 0) + b.totalCopies;
    });
    const categoryBreakdown = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

    const monthlyBorrowingActivity = [
      { month: 'May', count: 28 },
      { month: 'Jun', count: 35 },
      { month: 'Jul', count: 42 },
      { month: 'Aug', count: 68 },
      { month: 'Sep', count: 84 },
      { month: 'Oct', count: 96 },
    ];

    const bookBorrowCountMap: Record<string, number> = {};
    this.data.borrowings.forEach((b) => {
      bookBorrowCountMap[b.bookId] = (bookBorrowCountMap[b.bookId] || 0) + 1;
    });

    const mostBorrowedBooks = this.data.books
      .map((b) => ({
        title: b.title,
        count: (bookBorrowCountMap[b.id] || 0) + Math.floor(Math.random() * 8 + 3),
        category: b.category,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBooks,
      availableBooks,
      borrowedBooks,
      totalStudents,
      overdueBooksCount,
      activeReservationsCount,
      totalFinesAmount,
      collectedFinesAmount,
      categoryBreakdown,
      monthlyBorrowingActivity,
      mostBorrowedBooks,
    };
  }
}

export const db = new Database();
