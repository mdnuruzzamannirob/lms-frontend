import { NextResponse, type NextRequest } from "next/server";

const publicPaths = ["/login", "/register", "/verify-email", "/forgot-password"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("accessToken")?.value;

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  const isHome = pathname === "/";

  // Authenticated users hitting auth pages → redirect to dashboard
  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Unauthenticated users hitting protected pages → redirect to login
  if (!accessToken && !isPublic && !isHome) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
