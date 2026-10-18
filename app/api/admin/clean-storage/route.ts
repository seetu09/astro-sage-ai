import { NextRequest, NextResponse } from 'next/server';
import { hasValidSession, sessionFailureReason } from '@/lib/adminSession';
import { getServiceSupabase } from '@/lib/serverWallet';
import { ARTIFACT_IMAGE_BUCKET } from '@/lib/serverArtifactImages';

export const runtime = 'nodejs';

/**
 * Bucket for blog cover images (created by supabase/migrations/006_blog_posts.sql).
 * Duplicated here rather than imported: `lib/serverBlogPosts.ts` inlines the
 * string 'blog-images' in its upload path and does not export a constant, and
 * this task must not modify the upload logic. If the bucket is ever renamed,
 * update BOTH this line and lib/serverBlogPosts.ts.
 */
const BLOG_IMAGE_BUCKET = 'blog-images';

/** Page size for storage.list() — the supabase-js default; we page until exhausted. */
const LIST_PAGE_SIZE = 100;

/** Safety cap so a pathological bucket can never hang the route. */
const MAX_LIST_PAGES = 1000;

/** Supabase public URL shape: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path> */
const STORAGE_URL_MARKER = '/storage/v1/object/public/';

/** One orphaned (or, post-delete, deleted) file. */
type Orphan = {
  bucket: string;
  path: string;
  size: number;
};

/**
 * Extract the storage object path from a full public URL.
 *
 * The database stores FULL public URLs (artifacts.image_url, blog_posts.image_url),
 * e.g. https://xyz.supabase.co/storage/v1/object/public/artifact-images/1700-foo.jpg.
 * This returns '1700-foo.jpg' for that example, or null for anything that is not a
 * Supabase public-storage URL (external URLs, empty strings, seeded placeholder
 * paths like '/store/example-neelam.jpg').
 */
function pathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const markerIndex = url.indexOf(STORAGE_URL_MARKER);
  if (markerIndex === -1) return null;
  // Everything after ".../public/" is "<bucket>/<path>"; the object path is what
  // follows the first "/" after the marker.
  const afterMarker = url.slice(markerIndex + STORAGE_URL_MARKER.length);
  const slashIndex = afterMarker.indexOf('/');
  if (slashIndex === -1 || slashIndex === afterMarker.length - 1) return null;
  return afterMarker.slice(slashIndex + 1);
}

/**
 * List every object in a bucket, paging through storage.list() until exhausted.
 * storage.list() defaults to 100 items per call; a bucket with more objects
 * would otherwise be silently truncated and its tail misreported as orphaned.
 */
async function listAllObjects(
  bucket: string
): Promise<Array<{ name: string; size: number }>> {
  const supabase = getServiceSupabase();
  const files: Array<{ name: string; size: number }> = [];
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const { data, error } = await supabase.storage.from(bucket).list(undefined, {
      limit: LIST_PAGE_SIZE,
      offset: page * LIST_PAGE_SIZE,
    });
    if (error) {
      throw new Error(`Failed to list bucket "${bucket}": ${error.message}`);
    }
    const entries = data ?? [];
    for (const entry of entries) {
      // Folder entries come back with metadata null and (usually) a trailing
      // slash in the name. There are no sub-folders in either bucket today, but
      // skipping them keeps the comparison honest if one ever appears.
      if (!entry.name || entry.name.endsWith('/')) continue;
      const rawSize = entry.metadata?.size;
      files.push({
        name: entry.name,
        size: typeof rawSize === 'number' ? rawSize : 0,
      });
    }
    if (entries.length < LIST_PAGE_SIZE) break;
  }
  return files;
}

/** Read every image URL referenced by the artifacts table. */
async function loadArtifactImageUrls(): Promise<string[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('artifacts').select('image_url');
  if (error) {
    throw new Error(`Failed to read artifacts.image_url: ${error.message}`);
  }
  return (data ?? []).map((row) => String((row as { image_url: unknown }).image_url ?? ''));
}

/** Read every cover URL referenced by the blog_posts table. */
async function loadBlogImageUrls(): Promise<string[]> {
  const supabase = getServiceSupabase();
  const { data, error } = await supabase.from('blog_posts').select('image_url');
  if (error) {
    throw new Error(`Failed to read blog_posts.image_url: ${error.message}`);
  }
  return (data ?? []).map((row) => String((row as { image_url: unknown }).image_url ?? ''));
}


/**
 * POST /api/admin/clean-storage — find (and optionally delete) orphaned images.
 *
 * Orphan = a file in the `artifact-images` or `blog-images` bucket whose path is
 * NOT referenced by any row in `artifacts.image_url` / `blog_posts.image_url`.
 * The classic source is the admin image-upload flow: an image is uploaded to the
 * bucket BEFORE the catalog row is saved, and if the admin never saves (or edits
 * the URL afterwards), the uploaded file is never referenced and never cleaned up.
 *
 * Body: `{ "dryRun": true }` to scan only, `{ "dryRun": false }` to delete.
 * `dryRun` defaults to `true` so an absent or malformed body can never trigger
 * a destructive call.
 *
 * AUTH: admin session cookie only, re-checked in-handler (same pattern as
 * /api/admin/artifact-image). Reads and deletes go through the service role,
 * which bypasses storage RLS — so this check is the only authorization boundary.
 *
 * DELIBERATELY NOT COVERED: the `avatars` bucket. Avatars are keyed by user id
 * with no database column referencing the storage path (user_profiles stores no
 * avatar URL), so there is no safe "referenced set" to diff against — treating
 * every avatar as an orphan would delete every user's profile picture.
 */
export async function POST(req: NextRequest) {
  if (!hasValidSession(req)) {
    // Log the REASON only — never the cookie value or the session token.
    // eslint-disable-next-line no-console
    console.warn(
      '[POST /api/admin/clean-storage] 401 Unauthorized — reason:',
      sessionFailureReason(req)
    );
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  let dryRun = true;
  try {
    const body = (await req.json()) as { dryRun?: unknown };
    if (typeof body.dryRun === 'boolean') dryRun = body.dryRun;
  } catch {
    // Malformed or missing JSON body: fall back to dryRun = true (scan only).
    // A destructive operation must never be the default.
    dryRun = true;
  }

  try {
    // 1. Every image URL currently referenced by the database.
    const [artifactUrls, blogUrls] = await Promise.all([
      loadArtifactImageUrls(),
      loadBlogImageUrls(),
    ]);

    // 2. Full public URL -> storage object path (e.g. '1700-foo.jpg'). Null for
    //    external URLs or empty strings — those reference nothing in our buckets.
    const referencedPaths = new Set<string>();
    for (const url of [...artifactUrls, ...blogUrls]) {
      const path = pathFromPublicUrl(url);
      if (path) referencedPaths.add(path);
    }

    // 3. Every file currently in each bucket.
    const [artifactFiles, blogFiles] = await Promise.all([
      listAllObjects(ARTIFACT_IMAGE_BUCKET),
      listAllObjects(BLOG_IMAGE_BUCKET),
    ]);

    // 4. Bucket files whose path is NOT in the referenced set = orphans.
    const orphans: Orphan[] = [
      ...artifactFiles
        .filter((f) => !referencedPaths.has(f.name))
        .map((f) => ({ bucket: ARTIFACT_IMAGE_BUCKET, path: f.name, size: f.size })),
      ...blogFiles
        .filter((f) => !referencedPaths.has(f.name))
        .map((f) => ({ bucket: BLOG_IMAGE_BUCKET, path: f.name, size: f.size })),
    ];

    // 5. Dry run: report, never delete.
    if (dryRun) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        orphanCount: orphans.length,
        totalBytes: orphans.reduce((sum, o) => sum + o.size, 0),
        orphans,
      });
    }

    // 6. Real run: delete each bucket's orphans, then report what was deleted.
    const deleted: Orphan[] = [];
    for (const bucket of [ARTIFACT_IMAGE_BUCKET, BLOG_IMAGE_BUCKET]) {
      const paths = orphans.filter((o) => o.bucket === bucket).map((o) => o.path);
      if (paths.length === 0) continue;
      const supabase = getServiceSupabase();
      const { error } = await supabase.storage.from(bucket).remove(paths);
      if (error) {
        throw new Error(`Failed to delete from bucket "${bucket}": ${error.message}`);
      }
      deleted.push(...orphans.filter((o) => o.bucket === bucket));
    }

    return NextResponse.json({
      success: true,
      dryRun: false,
      deletedCount: deleted.length,
      deletedBytes: deleted.reduce((sum, o) => sum + o.size, 0),
      deleted,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[POST /api/admin/clean-storage]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}