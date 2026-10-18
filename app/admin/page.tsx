'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ImagePlus, Loader2, Sparkles, Trash2, XCircle } from 'lucide-react';

const CATEGORIES = ['Vedic Astrology', 'Love & Compatibility', 'Planetary Transits', 'Remedies'] as const;

type Notification = { type: 'success' | 'error'; message: string } | null;

/** One orphaned image reported by POST /api/admin/clean-storage (dry run). */
type StorageOrphan = { bucket: string; path: string; size: number };

/** Scan result state: null = never scanned, otherwise the last dry-run response. */
type StorageScan = { orphanCount: number; totalBytes: number; orphans: StorageOrphan[] } | null;

/** Human-readable size for the scan/delete summaries (e.g. 2.1 MB). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminPage() {
  // Access is enforced server-side by middleware.ts via the httpOnly
  // `admin_session` cookie — there is no client-side password gate here.
  // (The publish API separately re-validates ADMIN_PASSWORD server-side.)

  // Form fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Upload state & notifications
  const [publishing, setPublishing] = useState(false);
  const [notification, setNotification] = useState<Notification>(null);
  const previewUrlRef = useRef<string | null>(null);

  // Storage Maintenance state
  const [storageScan, setStorageScan] = useState<StorageScan>(null);
  const [scanning, setScanning] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Auto-dismiss notifications
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Revoke object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      previewUrlRef.current = url;
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setTitle('');
    setCategory(CATEGORIES[0]);
    setExcerpt('');
    setContent('');
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setImageFile(null);
    setImagePreview(null);
  };

  const handlePublish = async () => {
    setNotification(null);
    if (!title.trim() || !excerpt.trim() || !content.trim() || !imageFile) {
      setNotification({ type: 'error', message: 'Please fill in all fields and select a cover image.' });
      return;
    }

    setPublishing(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('excerpt', excerpt.trim());
      formData.append('content', content.trim());
      formData.append('imageFile', imageFile);

      const res = await fetch('/api/admin/blogs', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setNotification({ type: 'success', message: 'Post published successfully!' });
        resetForm();
      } else {
        const message =
          data.message ||
          (res.status === 401
            ? 'Unauthorized: incorrect admin password.'
            : 'Failed to publish post. Please try again.');
        setNotification({ type: 'error', message });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error — could not reach the server.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleScanStorage = async () => {
    setNotification(null);
    setScanning(true);
    try {
      const res = await fetch('/api/admin/clean-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: true }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setStorageScan({
          orphanCount: data.orphanCount ?? 0,
          totalBytes: data.totalBytes ?? 0,
          orphans: data.orphans ?? [],
        });
      } else {
        setNotification({ type: 'error', message: data.message || 'Storage scan failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error — could not reach the server.' });
    } finally {
      setScanning(false);
    }
  };

  const handleDeleteOrphans = async () => {
    if (!storageScan || storageScan.orphanCount === 0) return;
    const ok = window.confirm(
      `Are you sure you want to delete ${storageScan.orphanCount} orphaned image(s)? This cannot be undone.`
    );
    if (!ok) return;

    setNotification(null);
    setDeleting(true);
    try {
      const res = await fetch('/api/admin/clean-storage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dryRun: false }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setNotification({
          type: 'success',
          message: `Deleted ${data.deletedCount ?? 0} image(s), freeing ${formatBytes(data.deletedBytes ?? 0)}.`,
        });
        setStorageScan(null);
      } else {
        setNotification({ type: 'error', message: data.message || 'Delete failed.' });
      }
    } catch {
      setNotification({ type: 'error', message: 'Network error — could not reach the server.' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg ${
              notification.type === 'success'
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Publishing Form (access gated by middleware.ts) ---------- */}
      <div className="max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium mb-3">
              <Sparkles className="w-3 h-3" /> Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[var(--text-primary)]">Publish New Post</h1>
            <p className="astro-text-secondary mt-2">Create a cosmic article for your readers.</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="astro-card space-y-5">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[var(--text-primary)] mb-2">Title</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Post title..."
                className="astro-input w-full"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[var(--text-primary)] mb-2">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="astro-input w-full"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-[var(--card-bg)] text-[var(--text-primary)]">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Cover Image */}
            <div>
              <label htmlFor="cover" className="block text-sm font-medium text-[var(--text-primary)] mb-2">Cover Image</label>
              <label
                htmlFor="cover"
                className="flex items-center justify-center gap-2 astro-input w-full cursor-pointer hover:border-[var(--accent)] transition-colors"
              >
                <ImagePlus className="w-4 h-4 text-[var(--accent)]" />
                <span className="astro-text-muted text-sm truncate">
                  {imageFile ? imageFile.name : 'Choose an image...'}
                </span>
              </label>
              <input id="cover" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview && (
                <div className="mt-3 aspect-video rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--bg-secondary)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Short Excerpt */}
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-[var(--text-primary)] mb-2">Short Excerpt</label>
              <textarea
                id="excerpt"
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="A brief teaser shown on blog cards..."
                className="astro-input w-full resize-none"
              />
            </div>

            {/* Article Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[var(--text-primary)] mb-2">Article Content</label>
              <textarea
                id="content"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write article with simple paragraphs..."
                className="astro-input w-full resize-y"
              />
            </div>

            {/* Publish */}
            <button onClick={handlePublish} disabled={publishing} className="astro-button w-full disabled:opacity-60 disabled:cursor-not-allowed">
              {publishing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </span>
              ) : (
                'Publish Post'
              )}
            </button>
          </motion.div>

          {/* ---------- Storage Maintenance (orphaned-image cleanup) ---------- */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="astro-card mt-8 space-y-4"
          >
            <div>
              <h2 className="text-xl font-bold font-serif text-[var(--text-primary)]">Storage Maintenance</h2>
              <p className="astro-text-secondary text-sm mt-1">
                Find and delete uploaded images that are no longer referenced by any artifact or blog post.
              </p>
            </div>

            <button
              onClick={handleScanStorage}
              disabled={scanning || deleting}
              className="astro-button w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {scanning ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Scanning...
                </span>
              ) : (
                'Scan for Orphaned Images'
              )}
            </button>

            {storageScan && (
              <div className="space-y-3">
                {storageScan.orphanCount === 0 ? (
                  <p className="text-sm text-green-400">No orphaned images found. Storage is clean.</p>
                ) : (
                  <>
                    <p className="text-sm text-[var(--text-primary)]">
                      Found {storageScan.orphanCount} orphaned image
                      {storageScan.orphanCount === 1 ? '' : 's'}, totaling ~{formatBytes(storageScan.totalBytes)}.
                    </p>
                    <ul className="max-h-40 overflow-y-auto space-y-1 text-xs astro-text-secondary">
                      {storageScan.orphans.map((o) => (
                        <li key={`${o.bucket}/${o.path}`} className="truncate">
                          <span className="text-[var(--accent)]">[{o.bucket}]</span> {o.path} ({formatBytes(o.size)})
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={handleDeleteOrphans}
                      disabled={deleting}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-500/40 bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {deleting ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Deleting...
                        </span>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete {storageScan.orphanCount} Orphaned Image{storageScan.orphanCount === 1 ? '' : 's'}
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
    </div>
  );
}