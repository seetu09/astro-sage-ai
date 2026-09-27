import { NextRequest, NextResponse } from "next/server";
import { hasValidSession } from "@/lib/adminSession";
import {
  insertBlogPost,
  loadBlogPosts,
  uploadBlogCoverImage,
} from "@/lib/serverBlogPosts";

export const runtime = "nodejs";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * POST /api/admin/blogs — publish a post.
 *
 * Storage moved OFF THE FILESYSTEM (Task 2.2): cover images go to the
 * `blog-images` Supabase Storage bucket and the post row is inserted into
 * `public.blog_posts` (migration 006) through the service role. The previous
 * implementation wrote `public/blogs/*` + `data/posts.json` with fs.writeFile,
 * which can never work on Vercel's read-only runtime filesystem.
 *
 * Auth: the session cookie, re-checked IN the handler (defense in depth —
 * `middleware.ts` already gates `/api/admin/*`). The old model compared an
 * `adminPassword` form field the admin page never actually sent, so every
 * publish 401'd; the sibling `admin/artifacts` route uses this session check.
 */
export async function POST(req: NextRequest) {
  try {
    if (!hasValidSession(req)) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("imageFile") as File | null;

    if (!title || !category || !excerpt || !content || !imageFile) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 1) Cover image → Storage (public bucket; URL stored on the row).
    let imageUrl: string;
    try {
      imageUrl = await uploadBlogCoverImage(imageFile);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cover image upload failed.";
      // Validation failures (wrong type / too large) are the client's fault;
      // everything else (bucket missing, storage outage) is a 5xx.
      const isValidation = message.startsWith("Cover image must");
      return NextResponse.json({ message }, { status: isValidation ? 400 : 500 });
    }

    // 2) Post row → Postgres.
    const slug = generateSlug(title);
    if (!slug) {
      return NextResponse.json({ message: "Title is not usable as a slug." }, { status: 400 });
    }
    try {
      const post = await insertBlogPost({
        slug,
        title,
        category,
        excerpt,
        content,
        imageUrl,
      });
      return NextResponse.json({ success: true, slug: post.slug }, { status: 201 });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Internal server error";
      // Unique violation on slug — the admin needs to know, not get a generic 500.
      if (message.includes("duplicate key") || message.includes("23505")) {
        return NextResponse.json(
          { message: "A post with this title already exists. Change the title slightly." },
          { status: 409 }
        );
      }
      console.error("[POST /api/admin/blogs]", err);
      return NextResponse.json({ message }, { status: 500 });
    }
  } catch (error) {
    console.error("[POST /api/admin/blogs]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

/** GET — list published posts (admin use; session-gated by middleware + here). */
export async function GET(req: NextRequest) {
  if (!hasValidSession(req)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const posts = await loadBlogPosts();
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[GET /api/admin/blogs]", error);
    return NextResponse.json({ message: "Failed to load posts" }, { status: 500 });
  }
}

