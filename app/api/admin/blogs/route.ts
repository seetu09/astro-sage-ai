import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const POSTS_FILE = path.join(process.cwd(), "data", "posts.json");
const BLOGS_DIR = path.join(process.cwd(), "public", "blogs");

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const category = formData.get("category") as string;
    const excerpt = formData.get("excerpt") as string;
    const content = formData.get("content") as string;
    const imageFile = formData.get("imageFile") as File | null;
    const adminPassword = formData.get("adminPassword") as string;

    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: "Server misconfigured: ADMIN_PASSWORD is not set in environment variables." },
        { status: 500 }
      );
    }

    if (!title || !category || !excerpt || !content || !imageFile) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await fs.mkdir(BLOGS_DIR, { recursive: true });
    const fileName = `${Date.now()}-${imageFile.name}`;
    await fs.writeFile(path.join(BLOGS_DIR, fileName), Buffer.from(await imageFile.arrayBuffer()));

    const posts = JSON.parse(await fs.readFile(POSTS_FILE, "utf-8"));
    const post = {
      id: Date.now().toString(),
      slug: generateSlug(title),
      title,
      category,
      excerpt,
      content,
      image: `/blogs/${fileName}`,
      createdAt: new Date().toISOString(),
    };
    posts.push(post);
    await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2));

    return NextResponse.json({ success: true, slug: post.slug }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/blogs]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const posts = JSON.parse(await fs.readFile(POSTS_FILE, "utf-8"));
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[GET /api/admin/blogs]", error);
    return NextResponse.json({ posts: [] });
  }
}
