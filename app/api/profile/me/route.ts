import { NextRequest, NextResponse } from "next/server";
import { getUserFromAuthHeader } from "@/lib/serverWallet";
import {
  getUserProfile,
  saveUserProfile,
  type UserProfileRow,
} from "@/lib/serverUserProfiles";

/**
 * GET /api/profile/me — server-side birth-details profile for the signed-in
 * user (or an empty-rows snapshot for a guest).
 *
 * This is the server-side read path that replaces the client's
 * `useUserProfile()` localStorage-only fallback when a user is signed in.
 * `AuthContext.mapSupabaseUser()` still reads the birth fields from
 * `user_metadata`, so the client pre-fill keeps working for unsigned users and
 * for the first render; this route returns the server row so the client can
 * reconcile without re-typing anything.
 *
 * Auth: Bearer Supabase access token (mirrors /api/wallet / /api/chat).
 */
export async function GET(req: NextRequest) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const profile = await getUserProfile(user.id);
  return NextResponse.json({ profile });
}

/**
 * PUT /api/profile/me — upsert the server-side birth-details profile for the
 * signed-in user.
 *
 * Called by the pages whenever `saveProfile()` changes (kundali, matchmaking,
 * dosha-checker, numerology, chat). The write is the service-role upsert via
 * `public.upsert_user_profile`, so it is authoritative and RLS-safe. The row
 * is keyed by `(email, user_id)`; a guest email and a later signed-in account
 * reconcile to the same row via the email fallback.
 *
 * Body:
 * {
 *   name: string,
 *   dob: string,      // YYYY-MM-DD
 *   tob: string,      // HH:MM
 *   place: string,
 *   latitude: number | null,
 *   longitude: number | null,
 *   timezone: string, // IANA zone
 * }
 */
export async function PUT(req: NextRequest) {
  const user = await getUserFromAuthHeader(req);
  if (!user) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  let body: {
    name: string;
    dob: string;
    tob: string;
    place: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Client validates most fields; guard against empty strings here too.
  if (!body.dob || !body.tob || !body.place) {
    return NextResponse.json(
      { error: "dob, tob, and place are required" },
      { status: 400 }
    );
  }

  const profile = await saveUserProfile({
    userId: user.id,
    email: user.email ?? "",
    profile: {
      name: body.name || "User",
      dob: body.dob,
      tob: body.tob,
      place: body.place,
      latitude: body.latitude ?? null,
      longitude: body.longitude ?? null,
      timezone: body.timezone || "Asia/Kolkata",
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Failed to persist birth details" },
      { status: 500 }
    );
  }

  // Return the freshly written row so the client can reconcile its own state.
  const read = await getUserProfile(user.id);
  return NextResponse.json({ profile: read });
}
