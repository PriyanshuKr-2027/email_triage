import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, appPassword } = body;

        if (!name || !email || !appPassword) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        session.isLoggedIn = true;
        session.user = {
            name: name,
            gmailUser: email,
            gmailAppPassword: appPassword
        };

        await session.save();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
