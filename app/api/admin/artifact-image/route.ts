import { NextRequest, NextResponse } from 'next/server';
import { hasValidSession, sessionFailureReason } from '@/lib/adminSession';
import { uploadArtifactImage } from '@/lib/serverArtifactImages';

export const runtime = 'nodejs';

/** Multipart field the editor appends the picked file to. */
const FILE_FIELD = 'file';

/**
 * POST /api/admin/artifact-image — upload one product image, return its URL.
 *
 * The admin catalog editor (app/admin/artifacts/page.tsx) edits the catalog as
 * JSON and the Save button PUTs the textarea's contents, so the image URL has to
 * exist as a field on the artifact before it can be saved. This endpoint is the
 * piece that produces that URL: multipart in, `{ url }` out, and the editor
 * patches it into the artifact's `imageUrl` through `updateArtifact`, which
 * re-serializes the whole catalog back into the textarea. Nothing is written to
 * `public.artifacts` here — the upload is staged and persisted by the next
 * ordinary Save, exactly as a hand-typed URL would be.
 *
 * AUTH — SESSION COOKIE ONLY, AND THAT IS DELIBERATE. Do NOT "fix" this to
 * match `PUT /api/admin/artifacts`, which additionally requires the
 * `x-admin-password` header. The two answer different questions: the password is
 * the editor's save-time confirmation, and requiring it here would block an
 * upload that legitimately happens before the admin has typed it (or when they
 * only want to stage images and save later). The session cookie is the real
 * authorization boundary — it is set by /api/admin/login and enforced
 * server-side by middleware.ts for every /api/admin/* path.
 *
 * Accepted consequence of that choice: anyone holding an admin session can write
 * into the public `artifact-images` bucket. That is why the bucket is documented
 * as holding non-sensitive product imagery only, and why this route must never
 * be reused for avatars, receipts or any other user-supplied private file.
 *
 * Reads/writes go through the service role, which bypasses RLS.
 */
export async function POST(req: NextRequest) {
  try {
    // Re-checked IN the handler (defense in depth): middleware already gates
    // /api/admin/*, but a direct call — or an internal fetch that skips
    // middleware — must still be refused.
    if (!hasValidSession(req)) {
      // Log the REASON only. Never the cookie value, never the env var, never
      // any fragment of either: this line is server log output.
      // eslint-disable-next-line no-console
      console.warn(
        '[POST /api/admin/artifact-image] 401 Unauthorized — reason:',
        sessionFailureReason(req)
      );
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const entry = formData.get(FILE_FIELD);
    // A plain text part arrives as a string and cannot be uploaded; only a real
    // file part is accepted. Checked by type rather than `instanceof File` so
    // this does not depend on File being a global in every runtime.
    if (!entry || typeof entry === 'string') {
      return NextResponse.json(
        { message: `Missing image file (expected a "${FILE_FIELD}" file part).` },
        { status: 400 }
      );
    }
    const file = entry as File;

    let url: string;
    try {
      url = await uploadArtifactImage(file);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed.';
      // Validation failures (wrong type / too large) are the client's fault;
      // everything else (bucket missing, storage outage) is a 5xx. The prefix
      // is the contract declared in lib/serverArtifactImages.ts.
      const isValidation = message.startsWith('Artifact image must');
      if (!isValidation) {
        // eslint-disable-next-line no-console
        console.error('[POST /api/admin/artifact-image] upload failed', err);
      }
      return NextResponse.json({ message }, { status: isValidation ? 400 : 500 });
    }

    return NextResponse.json({ url }, { status: 201 });
  } catch (error) {
    // Malformed multipart body, body-parser failure, etc.
    // eslint-disable-next-line no-console
    console.error('[POST /api/admin/artifact-image]', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}