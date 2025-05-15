import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { logger } from "@/lib/utils/logger";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    logger.info("Session result:", session);

    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    logger.error("Middleware error:", error);
    // On error, redirect to login as a fallback
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  runtime: "nodejs",
  matcher: ["/((?!api/auth|login|_next|favicon\\.ico).*)"],
};
