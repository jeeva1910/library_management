import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { DigitalResource } from '../../types/index.ts';
import { Modal } from '../../components/common/Modal.tsx';
import { FileText, Plus, Edit2, Trash2, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

export const DigitalResourceManagementPage: React.FC = () => {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRes, setEditingRes] = useState<DigitalResource | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Computer Science');
  const [resourceUrl, setResourceUrl] = useState('');
  const [accessType, setAccessType] = useState<'all' | 'student' | 'faculty'>('all');
  const [fileType, setFileType] = useState<'pdf' | 'epub' | 'link' | 'video' | 'article'>('pdf');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    setLoading(true);
    try {
      const list = await api.getResources();
      setResources(list);
    } catch (e) {
      console.error('Failed to load resources', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingRes(null);
    setTitle('');
    setDescription('');
    setCategory('Computer Science');
    setResourceUrl('https://ocw.mit.edu/');
    setAccessType('all');
    setFileType('pdf');
    setAuthor('Academic Faculty');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRes) {
        await api.updateResource(editingRes.id, {
          title,
          description,
          category,
          resourceUrl,
          accessType,
          fileType,
          author,
        });
      } else {
        await api.createResource({
          title,
          description,
          category,
          resourceUrl,
          accessType,
          fileType,
          author,
          fileSize: '3.5 MB',
        });
      }
      setIsModalOpen(false);
      loadResources();
    } catch (e) {
      console.error('Failed creating/updating resource', e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this digital resource?')) return;
    try {
      await api.deleteResource(id);
      loadResources();
    } catch (e) {
      console.error('Failed deleting resource', e);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Digital Resource Repository Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage authorized e-books, research PDFs, lecture slides, and digital materials for student access.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Digital Resource
        </button>
      </div>

      {loading ? (
        <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-4">Resource Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Access Type</th>
                <th className="p-4">File Format</th>
                <th className="p-4">Downloads</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {resources.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{res.title}</span>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{res.description}</span>
                  </td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {res.category}
                    </span>
                  </td>
                  <td className="p-4 capitalize font-mono text-slate-600">{res.accessType}</td>
                  <td className="p-4 font-mono uppercase font-bold text-blue-600">{res.fileType}</td>
                  <td className="p-4 font-mono font-bold text-slate-900">{res.downloadCount}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Add / Edit Resource Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add Digital Material"
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Material Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Category *</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Resource URL / Download Link *</label>
              <input
                type="url"
                required
                value={resourceUrl}
                onChange={(e) => setResourceUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">File Format</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="epub">ePUB E-Book</option>
                  <option value="article">Article / Journal</option>
                  <option value="link">Web Repository Link</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Access Authorization</label>
                <select
                  value={accessType}
                  onChange={(e) => setAccessType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <option value="all">All Library Users</option>
                  <option value="student">Enrolled Students Only</option>
                  <option value="faculty">Faculty & Research Only</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
              >
                Save Resource
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
