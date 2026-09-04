/**
 * Shared retry helper for Gemini API calls.
 *
 * Retries 3 times (initial attempt + 2 retries) with exponential backoff
 * (1s, 2s, 4s) on HTTP 503 (Service Unavailable) responses. If all retries
 * fail, the caller is responsible for falling back to calculated/deterministic
 * data.
 *
 * Usage:
 *   const res = await geminiWithRetry(() => fetch(url, opts));
 *   // res is the last Response (successful or final failure)
 */

const MAX_ATTEMPTS = 3; // initial attempt + 2 retries
const BACKOFF_MS = [1000, 2000, 4000]; // 1s, 2s, 4s

export interface GeminiRetryResult {
  response: Response;
  /** Whether the response came from a retry attempt (i.e. the first attempt failed). */
  isRetry: boolean;
  /** Number of attempts made (1–3). */
  attempts: number;
}

/** Sleep for `ms` milliseconds. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Execute a fetch to the Gemini API with retry-on-503 logic.
 *
 * The `fetcher` is called up to `MAX_ATTEMPTS` times. On a non-503 error or
 * a non-OK response that isn't a 503, the last response is returned
 * immediately (no retry). On a 503, the fetcher is retried with increasing
 * backoff delays.
 *
 * @param fetcher A function that returns a Promise<Response> (typically a fetch call).
 * @returns The final GeminiRetryResult with the last response.
 */
export async function geminiWithRetry(
  fetcher: () => Promise<Response>
): Promise<GeminiRetryResult> {
  let isRetry = false;
  let response: Response = new Response(null as any, { status: 0 });

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      response = await fetcher();

      // 503 → retry after backoff
      if (response.status === 503 && attempt < MAX_ATTEMPTS) {
        console.warn(
          `[geminiRetry] Got 503 on attempt ${attempt}/${MAX_ATTEMPTS}; retrying in ${BACKOFF_MS[attempt - 1]}ms...`
        );
        await sleep(BACKOFF_MS[attempt - 1]);
        isRetry = true;
        continue;
      }

      // Any non-503 response (success or other error) → return immediately
      return { response, isRetry, attempts: attempt };
    } catch (err) {
      // Network-level failure (TypeError, abort, etc.) — treat like 503 and retry
      console.warn(
        `[geminiRetry] Network error on attempt ${attempt}/${MAX_ATTEMPTS}:`,
        err instanceof Error ? err.message : String(err)
      );
      if (attempt < MAX_ATTEMPTS) {
        await sleep(BACKOFF_MS[attempt - 1]);
        isRetry = true;
        continue;
      }
      throw err; // propagate on final attempt
    }
  }

  // All retries exhausted on 503
  return { response, isRetry, attempts: MAX_ATTEMPTS };
}
