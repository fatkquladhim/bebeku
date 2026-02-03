import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export interface AuthUser {
  username: string;
  role: string;
}

export async function verifyAuth(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as AuthUser;
  } catch (error) {
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
