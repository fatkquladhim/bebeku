import { jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "bebeku-default-secret-key-2026"
);

export interface AuthUser {
  username: string;
  role: string;
}

interface AuthJWTPayload extends JWTPayload {
  username: string;
  role: string;
}

export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) return null;

    const verified = await jwtVerify<AuthJWTPayload>(
      token,
      JWT_SECRET
    );

    return {
      username: verified.payload.username,
      role: verified.payload.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await verifyAuth();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
