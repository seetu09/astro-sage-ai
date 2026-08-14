import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const users: any[] = [];
const JWT_SECRET = process.env.JWT_SECRET || "astroveda-secret-key-change-in-production";

export async function PATCH(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const userIndex = users.findIndex((u) => u.id === decoded.userId);
    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const updates = await req.json();
    users[userIndex] = { ...users[userIndex], ...updates };

    const { password: _, ...userWithoutPassword } = users[userIndex];
    return NextResponse.json({ user: userWithoutPassword });
  } catch (error) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}
