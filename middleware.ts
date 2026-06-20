import { NextRequest, NextResponse } from "next/server";

// Memoir Gems — Internal admin protection
// Gates everything under /admin with HTTP Basic Auth.
// Credentials come from ADMIN_USER / ADMIN_PASSWORD in .env.local.

export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER;
  const expectedPass = process.env.ADMIN_PASSWORD;

  // If no credentials are configured, fail closed (block access) rather than
  // silently leaving the admin open.
  if (!expectedUser || !expectedPass) {
    return new NextResponse("Admin access is not configured. Set ADMIN_USER and ADMIN_PASSWORD.", {
      status: 503,
    });
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader?.startsWith("Basic ")) {
    // atob() is used instead of Buffer because this middleware runs in the
    // Edge runtime by default, where Node's Buffer is not available.
    const decoded = atob(authHeader.split(" ")[1]);
    const [user, pass] = decoded.split(":");
    if (user === expectedUser && pass === expectedPass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Memoir Gems Admin"' },
  });
}

export const config = {
  matcher: ["/admin/:path*"],
};
