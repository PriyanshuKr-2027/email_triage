import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function middleware(req: NextRequest) {
    const res = NextResponse.next();
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    const { pathname } = req.nextUrl;

    // Protect all routes except explicitly public ones (login, landing, static assets)
    if (
        !session.isLoggedIn &&
        pathname !== "/login" &&
        pathname !== "/" && // Allow Landing Page
        !pathname.startsWith("/api/login") &&
        !pathname.startsWith("/_next") &&
        !pathname.startsWith("/favicon.ico")
    ) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Redirect to dashboard if logged in and trying to access login
    if (session.isLoggedIn && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return res;
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
