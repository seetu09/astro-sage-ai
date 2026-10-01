import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * POST /api/admin/artifact-image — the product-image upload used by the admin
 * catalog editor (Task 4.3).
 *
 * What is under test, and why each case earns its place:
 *   - AUTH. The endpoint is gated by the admin session cookie ONLY. That is
 *     deliberate and documented in the route: the catalog PUT additionally
 *     requires `x-admin-password`, but the editor's password field is a save-time
 *     confirmation, and requiring it here would block an upload that legitimately
 *     happens before the admin types it. The "no password header" case below is
 *     the regression guard: it fails loudly if a future reader "fixes" the
 *     inconsistency the route's comment warns about.
 *   - The 400/500 split. A wrong type or an oversized file is the caller's fault
 *     (400); a missing bucket or a storage outage is ours (500). The route decides
 *     this from the "Artifact image must" message prefix, so a reworded error in
 *     lib/serverArtifactImages.ts would silently turn validation failures into
 *     500s — these cases pin both ends of that contract.
 *   - The 401 log line records a REASON enum and nothing else, so a log line can
 *     never leak the cookie or ADMIN_SESSION_TOKEN.
 *
 * Both collaborators are module-mocked: `@/lib/adminSession` so the three
 * failure reasons can be driven directly, and `@/lib/serverArtifactImages` so no
 * Supabase client is ever constructed.
 */

vi.mock('@/lib/adminSession', () => ({
  hasValidSession: vi.fn(),
  sessionFailureReason: vi.fn(),
}));

vi.mock('@/lib/serverArtifactImages', () => ({
  uploadArtifactImage: vi.fn(),
}));

import { hasValidSession, sessionFailureReason } from '@/lib/adminSession';
import { uploadArtifactImage } from '@/lib/serverArtifactImages';
import { POST } from '@/app/api/admin/artifact-image/route';

const UPLOADED_URL =
  'https://xyz.supabase.co/storage/v1/object/public/artifact-images/1700000000000-neelam.jpg';

/**
 * A minimal NextRequest stand-in: the route only ever reads `cookies` and calls
 * `formData()`. `formData` is a module-level `let` so each test can replace the
 * body (file part, text part, no part at all) without rebuilding the request.
 */
let formData: FormData;

function mockReq(cookie: string | null = 'valid-session') {
  return {
    cookies: {
      get: (name: string) =>
        name === 'admin_session' && cookie !== null ? { value: cookie } : undefined,
    },
    formData: async () => formData,
  } as unknown as Parameters<typeof POST>[0];
}

function withFile(name = 'neelam.jpg', type = 'image/jpeg') {
  formData = new FormData();
  formData.append('file', new File([new Uint8Array([1, 2, 3])], name, { type }));
}

describe('POST /api/admin/artifact-image', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    withFile();
    (hasValidSession as any).mockReturnValue(true);
    (sessionFailureReason as any).mockReturnValue(null);
    (uploadArtifactImage as any).mockResolvedValue(UPLOADED_URL);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('uploads the file and returns its URL (201)', async () => {
    const res = await POST(mockReq());

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ url: UPLOADED_URL });
    expect(uploadArtifactImage).toHaveBeenCalledTimes(1);
  });

  it('works with a session cookie and NO x-admin-password header (deliberate)', async () => {
    // Guards the documented asymmetry with PUT /api/admin/artifacts. If this ever
    // starts requiring the password, the editor can no longer stage an image
    // before the admin has entered the save password.
    const res = await POST(mockReq());
    expect(res.status).toBe(201);
  });

  it('401s and does NOT touch storage when the session is invalid', async () => {
    (hasValidSession as any).mockReturnValue(false);
    (sessionFailureReason as any).mockReturnValue('missing-cookie');

    const res = await POST(mockReq(null));

    expect(res.status).toBe(401);
    expect((await res.json()).message).toBe('Unauthorized');
    expect(uploadArtifactImage).not.toHaveBeenCalled();
  });

  it('logs the failure REASON on 401 and never the cookie or the token', async () => {
    (hasValidSession as any).mockReturnValue(false);
    (sessionFailureReason as any).mockReturnValue('invalid-cookie');

    await POST(mockReq('super-secret-cookie-value'));

    expect(console.warn).toHaveBeenCalled();
    const logged = JSON.stringify((console.warn as any).mock.calls);
    // The reason enum is safe to log...
    expect(logged).toContain('invalid-cookie');
    // ...the secret that produced it is not, in any form.
    expect(logged).not.toContain('super-secret-cookie-value');
  });

  it('400s when the request carries no file part', async () => {
    formData = new FormData();

    const res = await POST(mockReq());

    expect(res.status).toBe(400);
    expect(uploadArtifactImage).not.toHaveBeenCalled();
  });

  it('400s when the "file" part is plain text rather than a file', async () => {
    // A string part cannot be uploaded; treating it as a file would surface a
    // confusing TypeError deep in the upload instead of a clear 400 here.
    formData = new FormData();
    formData.append('file', 'not-a-file');

    const res = await POST(mockReq());

    expect(res.status).toBe(400);
    expect(uploadArtifactImage).not.toHaveBeenCalled();
  });

  it('400s (not 500) when the file is not an image', async () => {
    (uploadArtifactImage as any).mockRejectedValue(
      new Error('Artifact image must be an image file.')
    );

    const res = await POST(mockReq());

    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain('Artifact image must be an image file.');
  });

  it('400s (not 500) when the file is over 5 MB', async () => {
    (uploadArtifactImage as any).mockRejectedValue(
      new Error('Artifact image must be 5 MB or smaller.')
    );

    const res = await POST(mockReq());

    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain('5 MB or smaller');
  });

  it('500s when storage itself fails (missing bucket / outage)', async () => {
    // A non-validation failure must not be reported to the admin as their own bad
    // input — that is exactly what the message-prefix split buys us.
    (uploadArtifactImage as any).mockRejectedValue(
      new Error('Artifact image upload failed: bucket not found')
    );

    const res = await POST(mockReq());

    expect(res.status).toBe(500);
    expect(console.error).toHaveBeenCalled();
  });

  it('500s when the multipart body cannot be parsed at all', async () => {
    const req = {
      cookies: { get: () => ({ value: 'valid-session' }) },
      formData: async () => {
        throw new Error('malformed multipart body');
      },
    } as unknown as Parameters<typeof POST>[0];

    const res = await POST(req);

    expect(res.status).toBe(500);
    expect(uploadArtifactImage).not.toHaveBeenCalled();
  });
});
