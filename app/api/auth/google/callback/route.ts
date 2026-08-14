import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return new Response(
      `<script>window.opener.postMessage({type:"AUTH_ERROR",message:"${error}"},"*");window.close();</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  if (!code) {
    return new Response(
      `<script>window.opener.postMessage({type:"AUTH_ERROR",message:"No code received"},"*");window.close();</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    const googleUser = await userRes.json();

    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { userId: googleUser.id, email: googleUser.email },
      process.env.JWT_SECRET || "astroveda-secret-key-change-in-production",
      { expiresIn: "7d" }
    );

    const user = {
      id: googleUser.id,
      name: googleUser.name,
      email: googleUser.email,
      avatar: googleUser.picture,
    };

    return new Response(
      `<script>window.opener.postMessage({type:"AUTH_SUCCESS",token:"${token}",user:${JSON.stringify(user).replace(/"/g, '\"')}},"*");window.close();</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    return new Response(
      `<script>window.opener.postMessage({type:"AUTH_ERROR",message:"Authentication failed"},"*");window.close();</script>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }
}
