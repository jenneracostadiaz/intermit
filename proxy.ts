import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "./stack";

export default async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    // Paths to exclude from authentication check
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/handler") ||
        pathname === "/favicon.ico" ||
        pathname.startsWith("/api/auth") // Assuming auth APIs shouldn't be blocked
    ) {
        return NextResponse.next();
    }

    // Check authentication
    // We pass the request object as tokenStore to allow reading from request cookies/headers
    // independent of next/headers cookies() which works in Server Components
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
        const signInUrl = new URL("/handler/sign-in", request.url);
        // Optional: Add return URL
        // signInUrl.searchParams.set("return_url", pathname); 
        return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
