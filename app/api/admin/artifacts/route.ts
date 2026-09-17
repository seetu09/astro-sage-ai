import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { ArtifactCatalogSchema } from "@/lib/catalogSchema";

export const runtime = "nodejs";

const CATALOG_FILE = path.join(process.cwd(), "data", "artifacts.json");

/**
 * Admin API for managing `data/artifacts.json`.
 *
 * Auth pattern mirrors `app/api/admin/blogs/route.ts` — a shared
 * `ADMIN_PASSWORD` env var compared with a header on every request.
 * The password is never returned, never logged.
 */
export async function GET() {
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
