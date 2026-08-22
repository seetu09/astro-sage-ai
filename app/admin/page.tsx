'use client';

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ImagePlus, Loader2, Lock, Sparkles, XCircle } from 'lucide-react';

const CATEGORIES = ['Vedic Astrology', 'Love & Compatibility', 'Planetary Transits', 'Remedies'] as const;

type Notification = { type: 'success' | 'error'; message: string } | null;

export default function AdminPage() {
  // Password gate (local state only — re-validated by the API on every publish)
  const [password, setPassword] = useState('');
  const [unlocked, setUnlocked] = useState(false);

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

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setUnlocked(true);
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
      formData.append('adminPassword', password);

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

      {!unlocked ? (
        /* ---------- Password Gate ---------- */
        <div className="flex items-center justify-center min-h-[70vh]">
          <motion.form
            onSubmit={handleUnlock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="astro-card w-full max-w-md"
          >
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-[var(--accent)]" />
              </div>
              <h1 className="text-2xl font-bold font-serif text-[var(--text-primary)]">Admin Access</h1>
              <p className="astro-text-secondary text-sm mt-1">Enter the admin password to continue.</p>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="astro-input w-full mb-4"
              autoFocus
            />
            <button type="submit" disabled={!password.trim()} className="astro-button w-full disabled:opacity-50 disabled:cursor-not-allowed">
              Unlock Dashboard
            </button>
          </motion.form>
        </div>
      ) : (
        /* ---------- Publishing Form ---------- */
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
        </div>
      )}
    </div>
  );
}