import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ArtifactCatalogSchema } from "@/lib/catalogSchema";
import { hasValidSession } from "@/lib/adminSession";

export const runtime = "nodejs";

const CATALOG_FILE = path.join(process.cwd(), "data", "artifacts.json");

/**
 * Admin API for managing `data/artifacts.json`.
 *
 * Auth: requires both (a) a valid admin_session cookie (verified by middleware
 * and redundantly here via lib/adminSession, so the route is safe even if called
 * directly — e.g. via an internal fetch that bypasses middleware), and (b) for
 * mutations (PUT), the `x-admin-password` header matching ADMIN_PASSWORD.
 * GET is protected by the session cookie; the public storefront reads from
 * /api/artifacts instead.
 *
 * Note on timing safety: the session cookie is an opaque shared secret set by
 * `/api/admin/login` via crypto.randomBytes — never derived from user input —
 * so a plain `===` comparison at consumption time is safe. The timing-safe
 * property is enforced at token CREATION time in the login handler.
 */
export async function GET(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const raw = await fs.readFile(CATALOG_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const result = ArtifactCatalogSchema.safeParse(parsed);

    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error("[GET /api/admin/artifacts] catalog validation failed:", result.error.message);
      return NextResponse.json({ message: "Catalog validation failed" }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[GET /api/admin/artifacts]", error);
    return NextResponse.json({ message: "Failed to read catalog" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  // Session cookie (middleware + redundant check below).
  if (!hasValidSession(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Server misconfigured: ADMIN_PASSWORD is not set in environment variables." },
        { status: 500 }
      );
    }

    const adminPassword = req.headers.get("x-admin-password");

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Parse & validate the full JSON body.
    const body = await req.json();
    const result = ArtifactCatalogSchema.safeParse(body);

    if (!result.success) {
      // eslint-disable-next-line no-console
      console.error("[PUT /api/admin/artifacts] validation errors:", result.error.message);
      return NextResponse.json(
        { message: "Validation failed", errors: result.error.issues },
        { status: 400 }
      );
    }

    // Write back to the file — pretty-printed for human readability.
    await fs.writeFile(CATALOG_FILE, JSON.stringify(result.data, null, 2), "utf-8");

    return NextResponse.json({ success: true, version: result.data.version });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[PUT /api/admin/artifacts]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
