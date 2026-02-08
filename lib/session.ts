import { SessionOptions } from "iron-session";

export interface SessionData {
    user?: {
        name: string;
        gmailUser: string;
        gmailAppPassword?: string; // App Password needs to be stored to access Gmail
    };
    isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
    password: process.env.SECRET_COOKIE_PASSWORD as string || "complex_password_at_least_32_characters_long",
    cookieName: "email_triage_session",
    cookieOptions: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
    },
};

// This is where we specify the typing of `req.session.*`
declare module "iron-session" {
    interface IronSessionData extends SessionData { }
}
