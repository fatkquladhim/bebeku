import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

// Routes yang memerlukan autentikasi
const PROTECTED_ROUTES = [
  "/dashboard",
  "/batches",
  "/barns",
  "/feed",
  "/eggs",
  "/finance",
  "/chatbot",
];

// Routes publik yang tidak boleh diakses jika sudah login
const AUTH_ROUTES = ["/peternak-masuk"];

// Routes yang bisa diakses publik
const PUBLIC_ROUTES = [
  "/",
  "/peternak-masuk",
  "/api/auth/login",
  "/api/auth/logout",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek apakah route adalah auth route (login)
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Cek apakah route protected
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Ambil token dari cookie
  const token = request.cookies.get("auth-token")?.value;

  // Jika sudah login dan mencoba akses halaman login, redirect ke dashboard
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      // Token invalid, biarkan akses halaman login
    }
  }

  // Jika protected route dan tidak ada token, redirect ke login
  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/peternak-masuk", request.url));
    }

    try {
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/peternak-masuk", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
