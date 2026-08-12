import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const users: any[] = [];
const JWT_SECRET = process.env.JWT_SECRET || "astroveda-secret-key-change-in-production";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      birthDate: null,
      birthTime: null,
      birthPlace: null,
      createdAt: new Date().toISOString(),
    };

    users.push(user);

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
