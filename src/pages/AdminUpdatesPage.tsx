import { useState, useRef } from 'react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../components/Toast';
import { Update, EventType } from '../types';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Link,
  FileText,
  ExternalLink,
  Search,
  Tag,
  Upload,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function AdminUpdatesPage() {
  const { updates, addUpdate, editUpdate, deleteUpdate } = useData();
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<Update | null>(null);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [form, setForm] = useState<{
    title: string;
    description: string;
    thumbnail: string;
    link: string;
    category: EventType;
  }>({
    title: '',
    description: '',
    thumbnail: '',
    link: '',
    category: 'ADMIN COVERAGE',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be less than 5MB', 'error');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, thumbnail: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const filteredUpdates = updates.filter(
    (u) =>
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingUpdate(null);
    setForm({ title: '', description: '', thumbnail: '', link: '', category: 'ADMIN COVERAGE' });
    setModalOpen(true);
  };

  const openEdit = (update: Update) => {
    setEditingUpdate(update);
    setForm({
      title: update.title,
      description: update.description,
      thumbnail: update.thumbnail,
      link: update.link,
      category: update.category || 'ADMIN COVERAGE',
    });
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditingUpdate(null);
    setForm({ title: '', description: '', thumbnail: '', link: '', category: 'ADMIN COVERAGE' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.link.trim()) {
      showToast('Title and link are required', 'error');
      return;
    }

    if (editingUpdate) {
      editUpdate(editingUpdate.id, form);
      showToast('Update edited successfully!', 'success');
    } else {
      addUpdate(form);
      showToast('Update published successfully!', 'success');
    }
    handleClose();
  };

  const handleDelete = (id: string) => {
    deleteUpdate(id);
    setDeleteConfirm(null);
    showToast('Update deleted successfully', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-accent">Manage Updates</h1>
          <p className="text-muted mt-1">Add, edit, or remove photo/video updates</p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md shadow-green-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Update
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6 animate-fade-in">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          type="text"
          placeholder="Search updates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      {/* Updates Table */}
      {filteredUpdates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-border animate-fade-in">
          <Image className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-accent mb-1">
            {search ? 'No updates match your search' : 'No updates yet'}
          </p>
          <p className="text-muted text-sm mb-4">
            {search ? 'Try adjusting your search' : 'Click "Add Update" to create your first update'}
          </p>
          {!search && (
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Update
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden animate-fade-in">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Thumbnail</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Title & Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Link</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Date</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUpdates.map((update) => (
                  <tr key={update.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <img
                        src={update.thumbnail}
                        alt={update.title}
                        className="w-16 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop';
                        }}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium text-accent max-w-[200px] truncate">{update.title}</p>
                        {update.category && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600 whitespace-nowrap">
                            {update.category}
                          </span>
                        )}
                      </div>
                      {update.description && (
                        <p className="text-xs text-muted max-w-xs truncate">{update.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <a
                        href={update.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-w-[200px] truncate"
                      >
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{update.link}</span>
                      </a>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted whitespace-nowrap">
                      {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(update)}
                          className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-bg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {deleteConfirm === update.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(update.id)}
                              className="px-2 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(update.id)}
                            className="p-2 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-border">
            {filteredUpdates.map((update) => (
              <div key={update.id} className="p-4">
                <div className="flex gap-3">
                  <img
                    src={update.thumbnail}
                    alt={update.title}
                    className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=100&h=100&fit=crop';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-accent truncate">{update.title}</p>
                    </div>
                    {update.category && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-600">
                        {update.category}
                      </span>
                    )}
                    <p className="text-xs text-muted mt-1">
                      {format(parseISO(update.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 mt-3">
                  <button
                    onClick={() => openEdit(update)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-bg text-primary hover:bg-primary/20 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5 inline mr-1" />
                    Edit
                  </button>
                  {deleteConfirm === update.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleDelete(update.id)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500 text-white"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirm(update.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={handleClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full animate-scale-in overflow-hidden max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold text-accent">
                {editingUpdate ? 'Edit Update' : 'Add New Update'}
              </h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Thumbnail */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  <ImageIcon className="w-3.5 h-3.5 inline mr-1.5" />
                  Thumbnail Image
                </label>
                <div 
                  className={`w-full border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${form.thumbnail ? 'border-primary bg-primary/5' : 'border-border hover:bg-gray-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  {form.thumbnail ? (
                    <div className="relative">
                      <img
                        src={form.thumbnail}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                        <p className="text-white text-sm font-medium flex items-center gap-2">
                          <Upload className="w-4 h-4" /> Change Image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <Upload className="w-8 h-8 text-muted mx-auto mb-2" />
                      <p className="text-sm text-accent font-medium">Click to upload thumbnail</p>
                      <p className="text-xs text-muted mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <FileText className="w-3.5 h-3.5 inline mr-1.5" />
                    Title *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Event or update title"
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-accent mb-1.5">
                    <Tag className="w-3.5 h-3.5 inline mr-1.5" />
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as EventType })}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  >
                    <option value="ADMIN COVERAGE">ADMIN COVERAGE</option>
                    <option value="STUDENT COVERAGE">STUDENT COVERAGE</option>
                    <option value="PROJECT">PROJECT</option>
                    <option value="CAPACITY BUILDING">CAPACITY BUILDING</option>
                  </select>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  <Link className="w-3.5 h-3.5 inline mr-1.5" />
                  External Link *
                </label>
                <input
                  type="url"
                  value={form.link}
                  onChange={(e) => setForm({ ...form, link: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or Google Drive link"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-accent mb-1.5">
                  Description (optional)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of the update..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-md shadow-green-500/20"
                >
                  {editingUpdate ? 'Save Changes' : 'Publish Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
