import imaps from 'imap-simple';
import { simpleParser } from 'mailparser';
import { Email } from '@/app/types';

export async function getUnreadEmails(user: string, pass: string, limit: number = 20): Promise<Email[]> {
    if (!user || !pass) {
        throw new Error("Missing Gmail credentials");
    }

    const config = {
        imap: {
            user: user,
            password: pass,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 3000,
        },
    };

    let connection: imaps.ImapSimple | null = null;

    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const searchCriteria = ['UNSEEN'];
        const fetchOptions = {
            bodies: [''], // Fetch entire email body
            markSeen: false
        };

        const messages = await connection.search(searchCriteria, fetchOptions);
        // Process most recent messages first
        const recentMessages = messages.reverse().slice(0, limit);

        const processedMessages = await Promise.all(recentMessages.map(async (item) => {
            const all = item.parts.find(part => part.which === '');
            const id = item.attributes.uid.toString();
            const source = all?.body;

            if (!source) return null;

            try {
                const parsed = await simpleParser(source);
                const email: Email = {
                    id,
                    from: parsed.from?.text || 'Unknown',
                    subject: parsed.subject || 'No Subject',
                    date: parsed.date ? parsed.date.toISOString() : new Date().toISOString(),
                    snippet: (parsed.text || '').substring(0, 100),
                    body: parsed.text || '',
                    html: typeof parsed.html === 'string' ? parsed.html : undefined
                };
                return email;
            } catch (err) {
                console.error(`Failed to parse email ${id}`, err);
                return null;
            }
        }));

        return processedMessages.filter((msg): msg is Email => msg !== null);

    } catch (error) {
        console.error('[Gmail Service] Error:', error);
        throw error;
    } finally {
        if (connection) {
            connection.end();
        }
    }
}
