import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.ts';
import { DigitalResource } from '../../types/index.ts';
import { Modal } from '../../components/common/Modal.tsx';
import {
  FileText,
  Search,
  Download,
  ExternalLink,
  BookOpen,
  Eye,
  Sparkles,
  FileCode,
  Globe,
  Layers,
} from 'lucide-react';

export const DigitalResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<DigitalResource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewResource, setPreviewResource] = useState<DigitalResource | null>(null);

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

  const handleDownload = async (res: DigitalResource) => {
    try {
      await api.recordResourceDownload(res.id);
      window.open(res.resourceUrl, '_blank');
      loadResources();
    } catch (e) {
      console.error('Failed recording download', e);
    }
  };

  const categories = ['All', 'Computer Science', 'Physics', 'Biotechnology', 'Economics & Business'];

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = selectedCategory === 'All' || r.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Digital Library & Learning Resources
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Authorized open e-books, lecture slides, research papers, and academic data repositories.
        </p>
      </div>

      {/* Toolbar Search & Category Pills */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search digital resources, research papers, topic keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
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

      {/* Resources Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-slate-200 rounded-xl" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">No Resources Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No digital learning materials matched your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <div
              key={res.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between gap-4 group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {res.category}
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {res.fileType} &middot; {res.fileSize || '2 MB'}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {res.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  {res.downloadCount} views
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewResource(res)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" /> Preview
                  </button>

                  <button
                    onClick={() => handleDownload(res)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> Access
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resource Document Preview Modal */}
      {previewResource && (
        <Modal
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
          title={`Digital Material Preview: ${previewResource.title}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-2">
              <span className="text-[10px] uppercase font-bold text-blue-300">
                {previewResource.category} &middot; {previewResource.fileType}
              </span>
              <h3 className="text-base font-bold">{previewResource.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {previewResource.description}
              </p>
            </div>

            {/* Simulated Reader View */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4 text-xs text-slate-700">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-slate-900">Document Reader View</span>
                <span className="text-[10px] font-mono text-slate-500">
                  Publisher/Author: {previewResource.author || 'Academic Department'}
                </span>
              </div>
              <p className="leading-relaxed text-slate-600">
                This document is part of the authorized academic digital repository of Apex University Digital Library. Students enrolled in authorized courses are granted full view and download rights.
              </p>
              <div className="p-4 bg-white rounded-lg border border-slate-200 text-center font-mono text-slate-500">
                [ Interactive PDF Reader Preview - Standard 10-Page Excerpt ]
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setPreviewResource(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewResource);
                  setPreviewResource(null);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Open Full Document
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
