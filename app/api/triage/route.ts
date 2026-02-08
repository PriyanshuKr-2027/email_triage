import { NextResponse } from 'next/server';
import { processEmailWithScaleDown } from '@/services/scaledown';
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        if (!session.isLoggedIn || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Use server-side key
        const groqApiKey = process.env.GROQ_API_KEY;

        if (!groqApiKey) {
            return NextResponse.json({ error: 'Server configuration error: Missing Groq API Key' }, { status: 500 });
        }

        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email data required' }, { status: 400 });
        }

        const result = await processEmailWithScaleDown(email, groqApiKey);
        return NextResponse.json({ result });
    } catch (error) {
        console.error("Error processing email:", error);
        return NextResponse.json({ error: 'Failed to triage email' }, { status: 500 });
    }
}
