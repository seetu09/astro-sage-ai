/**
 * serverArtifactImages.ts
 * -----------------------
 * Product-image upload for the artifact catalog (Task 4.3).
 *
 * Deliberately a SEPARATE endpoint + module from the catalog read/write path,
 * mirroring how `lib/serverBlogPosts.ts` owns blog publishing. The admin editor
 * (app/admin/artifacts/page.tsx) edits the catalog as JSON: the textarea is the
 * payload of record and the Save button PUTs its contents, so an upload cannot
 * be part of that PUT without either (a) a two-phase "upload first, then commit"
 * protocol or (b) base64 in the JSON. Instead this returns a URL, and the editor
 * writes that URL into the artifact's `imageUrl` through the same
 * `onChange -> updateArtifact` path as every other field, so the URL lands in the
 * textarea and is persisted by the next ordinary Save.
 *
 * That is also why the route is stateless: an upload works for an artifact id
 * that is not in the database yet, which is the "add the product, then add its
 * photo" order the editor actually allows.
 *
 * The validation, the filename sanitization and the `upsert: false` upload are
 * copied from `uploadBlogCoverImage` (lib/serverBlogPosts.ts) rather than
 * re-invented, so artifact images and blog covers behave identically. Both
 * validation failures are thrown with a message starting "Artifact image must" /
 * "Cover image must" — the route uses that prefix to answer 400 (the caller's
 * fault) instead of 500 (a bucket or storage outage), so the wording is load
 * bearing; keep the two in sync.
 */

import { getServiceSupabase } from '@/lib/serverWallet';

/** Bucket created by supabase/migrations/008_artifact_images_bucket.sql. */
export const ARTIFACT_IMAGE_BUCKET = 'artifact-images';

/** Matches the blog cover limit; the editor surfaces the same 5 MB note. */
const MAX_BYTES = 5 * 1024 * 1024;

/** Prefix the upload route matches on to map a throw to 400 rather than 500. */
const VALIDATION_MESSAGE_PREFIX = 'Artifact image must';

/**
 * Upload one product image and return its PUBLIC url.
 *
 * Throws for a non-image or an oversized file (client's fault → 400) and for any
 * storage failure (bucket missing, outage → 500); the caller distinguishes the
 * two via the message prefix above. The bytes are read into memory as the blog
 * cover path does — at a 5 MB ceiling that is bounded, and it keeps the upload
 * body a plain multipart form rather than a signed-URL two-step.
 */
export async function uploadArtifactImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${VALIDATION_MESSAGE_PREFIX} be an image file.`);
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`${VALIDATION_MESSAGE_PREFIX} be 5 MB or smaller.`);
  }

  const supabase = getServiceSupabase();
  const bytes = Buffer.from(await file.arrayBuffer());
  // Same sanitizer as the blog cover: lowercase, non-`[a-z0-9.-_]` runs to '-',
  // collapses repeats, tail-truncated, and prefixed with the timestamp so two
  // uploads of the same filename never collide (and never overwrite).
  const safeName = (file.name || 'artifact-image')
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(-80);
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(ARTIFACT_IMAGE_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (error) {
    console.error('UPLOAD_ARTIFACT_IMAGE_FAILED', error.message);
    throw new Error(`Artifact image upload failed: ${error.message}`);
  }

  const { data } = supabase.storage.from(ARTIFACT_IMAGE_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) {
    throw new Error('Artifact image upload failed: could not build a public URL.');
  }
  return data.publicUrl;
}