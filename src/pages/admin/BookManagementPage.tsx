import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { Book } from '../../types/index.ts';
import { Modal } from '../../components/common/Modal.tsx';
import { StatusBadge } from '../../components/common/StatusBadge.tsx';
import { BookCoverPlaceholder } from '../../components/common/BookCoverPlaceholder.tsx';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle2,
  XCircle,
  MapPin,
  Layers,
} from 'lucide-react';

export const BookManagementPage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [publisher, setPublisher] = useState('');
  const [publicationYear, setPublicationYear] = useState<number>(2024);
  const [totalCopies, setTotalCopies] = useState<number>(5);
  const [description, setDescription] = useState('');
  const [locationRack, setLocationRack] = useState('CS-A1-01');

  useEffect(() => {
    loadBooks();
  }, [searchQuery, selectedCategory]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const list = await api.getBooks({
        search: searchQuery,
        category: selectedCategory,
      });
      setBooks(list);
    } catch (e) {
      console.error('Failed to load books', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setIsbn(`978-${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    setCategory('Computer Science');
    setPublisher('Academic Press');
    setPublicationYear(2024);
    setTotalCopies(5);
    setDescription('');
    setLocationRack('CS-A1-01');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setTitle(book.title);
    setAuthor(book.author);
    setIsbn(book.isbn);
    setCategory(book.category);
    setPublisher(book.publisher);
    setPublicationYear(book.publicationYear);
    setTotalCopies(book.totalCopies);
    setDescription(book.description);
    setLocationRack(book.locationRack || 'GEN-A1-01');
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingBook) {
        await api.updateBook(editingBook.id, {
          title,
          author,
          isbn,
          category,
          publisher,
          publicationYear,
          totalCopies,
          availableCopies: Math.min(editingBook.availableCopies + (totalCopies - editingBook.totalCopies), totalCopies),
          description,
          locationRack,
        });
        setMessage({ type: 'success', text: `Updated "${title}" successfully.` });
      } else {
        await api.createBook({
          title,
          author,
          isbn,
          category,
          publisher,
          publicationYear,
          totalCopies,
          availableCopies: totalCopies,
          description,
          locationRack,
        });
        setMessage({ type: 'success', text: `Added new book "${title}" to library database.` });
      }
      setIsModalOpen(false);
      loadBooks();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Operation failed' });
    }
  };

  const handleDelete = async (id: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}" from the library catalog?`)) return;
    setDeletingId(id);
    try {
      await api.deleteBook(id);
      setMessage({ type: 'success', text: `Deleted "${bookTitle}".` });
      loadBooks();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete book' });
    } finally {
      setDeletingId(null);
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

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Book Inventory & CRUD Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Add new titles, edit copies, adjust shelf locations, and maintain the library database.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Book Title
        </button>
      </div>

      {/* Message Toast */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search catalog by title, author, category, ISBN, rack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table List View */}
      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : books.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Books Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Title & Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">ISBN</th>
                <th className="p-4">Copies (Avail / Total)</th>
                <th className="p-4">Shelf Rack</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {books.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{b.title}</span>
                    <span className="text-[11px] text-slate-500">{b.author}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {b.category}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-slate-600">{b.isbn}</td>
                  <td className="p-4 font-mono">
                    <span className={`font-bold ${b.availableCopies > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {b.availableCopies}
                    </span>{' '}
                    / {b.totalCopies}
                  </td>
                  <td className="p-4 font-mono text-blue-700 font-bold">{b.locationRack || 'GEN-A1'}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(b)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit book"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id, b.title)}
                        disabled={deletingId === b.id}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete book"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Book Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingBook ? `Edit Book: ${editingBook.title}` : 'Add New Book Title'}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Book Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Author(s) *</label>
                <input
                  type="text"
                  required
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ISBN *</label>
                <input
                  type="text"
                  required
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Economics & Business">Economics & Business</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Literature">Literature</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publisher</label>
                <input
                  type="text"
                  value={publisher}
                  onChange={(e) => setPublisher(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Publication Year</label>
                <input
                  type="number"
                  value={publicationYear}
                  onChange={(e) => setPublicationYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Total Copies Count</label>
                <input
                  type="number"
                  min="1"
                  value={totalCopies}
                  onChange={(e) => setTotalCopies(parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Shelf Location Rack</label>
                <input
                  type="text"
                  value={locationRack}
                  onChange={(e) => setLocationRack(e.target.value)}
                  placeholder="e.g. CS-A1-04"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description / Synopsis</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
              >
                {editingBook ? 'Save Changes' : 'Create Book Title'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
