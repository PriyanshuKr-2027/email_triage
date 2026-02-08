import { NextResponse } from 'next/server';
import { getUnreadEmails } from '@/services/gmail';
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.isLoggedIn || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { gmailUser, gmailAppPassword } = session.user;

        if (!gmailUser || !gmailAppPassword) {
            return NextResponse.json({ error: 'Missing Gmail credentials in session' }, { status: 400 });
        }

        const emails = await getUnreadEmails(gmailUser, gmailAppPassword);
        return NextResponse.json({ emails });
    } catch (error) {
        console.error("Error fetching emails:", error);
        return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 });
    }
}
