import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { api } from '../../services/api.ts';
import { Book } from '../../types/index.ts';
import { BookCoverPlaceholder } from '../../components/common/BookCoverPlaceholder.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { Modal } from '../../components/common/Modal.tsx';
import {
  Search,
  Filter,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Calendar,
  Building,
  Info,
  Layers,
  ArrowUpDown,
  Sparkles,
} from 'lucide-react';

export const BookSearchPage: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [availableOnly, setAvailableOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('title');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory, availableOnly, sortBy]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const list = await api.getBooks({
        search: searchQuery,
        category: selectedCategory,
        availableOnly,
        sortBy,
      });
      setBooks(list);
    } catch (err) {
      console.error('Failed to load books', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All',
    'Computer Science',
    'Artificial Intelligence',
    'Physics',
    'Mathematics',
    'Economics & Business',
    'Biotechnology',
    'Literature',
    'Data Science',
    'Engineering',
  ];

  const handleReserve = async (book: Book) => {
    if (!user) return;
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);
    try {
      const res = await api.reserveBook(user.id, book.id);
      setActionSuccess(
        `Successfully reserved "${book.title}"! You are queue position #${res.queuePosition}.`
      );
      loadBooks();
    } catch (err: any) {
      setActionError(err.message || 'Failed to reserve book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Library Book Catalog & Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Search books by title, author, category, or ISBN. Check real-time shelf copy availability or place a reservation.
        </p>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="font-bold text-emerald-900">
            Dismiss
          </button>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="font-bold text-rose-900">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filtering Controls Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search title, author, category, ISBN, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          {/* Availability Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none whitespace-nowrap bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            Available copies only
          </label>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="title">Title (A-Z)</option>
              <option value="author">Author (A-Z)</option>
              <option value="year">Newest Publication</option>
              <option value="availability">Most Available Copies</option>
            </select>
          </div>
        </div>

        {/* Category Horizontal Filter Tabs (Interactive Segmented Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid Display */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="bg-slate-200 h-72 rounded-xl" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Books Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No library books matched your search query or filter criteria. Try resetting search parameters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setAvailableOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const isAvailable = book.availableCopies > 0;
            return (
              <div
                key={book.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-4 space-y-3">
                  {/* Book Cover Placeholder */}
                  <BookCoverPlaceholder
                    title={book.title}
                    author={book.author}
                    category={book.category}
                    gradient={book.coverGradient}
                  />

                  {/* Stock Availability Badge & Location */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <StatusBadge
                      status={isAvailable ? 'available' : 'unavailable'}
                      label={isAvailable ? `${book.availableCopies} Copies Available` : 'Out of Stock'}
                    />
                    <span className="text-[11px] font-mono text-slate-500 font-medium">
                      Rack: {book.locationRack || 'GEN-A1'}
                    </span>
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{book.author}</p>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex-1 py-1.5 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-400" /> Details
                  </button>

                  {!isAvailable && (
                    <button
                      onClick={() => handleReserve(book)}
                      disabled={submitting}
                      className="flex-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" /> Reserve
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <Modal
          isOpen={!!selectedBook}
          onClose={() => setSelectedBook(null)}
          title="Book Details & Availability"
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <BookCoverPlaceholder
                title={selectedBook.title}
                author={selectedBook.author}
                category={selectedBook.category}
                gradient={selectedBook.coverGradient}
                className="w-full sm:w-36 h-48 shrink-0"
              />

              <div className="space-y-3 flex-1">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {selectedBook.category}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {selectedBook.title}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">{selectedBook.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">ISBN</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedBook.isbn}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Publisher</span>
                    <span className="text-slate-800 font-semibold">{selectedBook.publisher} ({selectedBook.publicationYear})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Copies</span>
                    <span className="font-mono text-slate-800 font-semibold">{selectedBook.totalCopies} copies</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Shelf Location</span>
                    <span className="font-mono text-blue-700 font-bold">{selectedBook.locationRack || 'GEN-A1-01'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={selectedBook.availableCopies > 0 ? 'available' : 'unavailable'}
                    label={`${selectedBook.availableCopies} of ${selectedBook.totalCopies} Copies Available`}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                Book Synopsis & Description
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                {selectedBook.description || 'No detailed description available.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>

              {selectedBook.availableCopies > 0 ? (
                <div className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200">
                  Available at Desk — Visit Librarian to Borrow
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleReserve(selectedBook);
                    setSelectedBook(null);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <BookmarkCheck className="w-4 h-4" /> Reserve Book
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
