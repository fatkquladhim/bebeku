import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SignJWT } from "jose";

// Secret key untuk JWT - sebaiknya gunakan environment variable
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Hardcoded credentials untuk demo
// Di production, gunakan database dengan password hashed
const VALID_CREDENTIALS = {
  username: "adminbebeku",
  password: "juraganbebek",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validasi input
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Cek credentials
    if (
      username !== VALID_CREDENTIALS.username ||
      password !== VALID_CREDENTIALS.password
    ) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Buat JWT token
    const token = await new SignJWT({
      username,
      role: "admin",
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 jam
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
