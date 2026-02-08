export interface Email {
    id: string;
    from: string;
    subject: string;
    date: string; // Serialized date
    snippet: string;
    body: string;
    html?: string;
}

export interface TriageResult {
    emailId: string;
    category: 'Urgent' | 'Work' | 'Personal' | 'Newsletter' | 'Spam' | 'Review';
    summary: string;
    suggestedResponse?: string;
    action: 'Reply' | 'Archive' | 'Delete' | 'Review';
}
