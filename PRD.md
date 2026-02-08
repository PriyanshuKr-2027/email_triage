# Product Requirements Document (PRD): Email Triage Assistant

## 1. Executive Summary
The **Email Triage Assistant** is a web-based specifically designed to help users manage email overload. By leveraging Large Language Models (LLMs) via Groq and ScaleDown, it automatically categorizes, summarizes, and drafts responses for incoming emails, allowing users to process their inbox significantly faster than traditional methods.

## 2. Problem Statement
Professionals spend an average of 2.6 hours per day reading and answering emails. The sheer volume makes it difficult to prioritize urgent tasks, leading to:
*   **Decision Fatigue**: Constantly deciding what to delete, archive, or reply to.
*   **Lost Productivity**: Time spent reading irrelevant newsletters or spam.
*   **Missed Opportunities**: Urgent emails getting buried under low-priority messages.

## 3. Goals & Objectives
*   **Reduce Triage Time**: Cut down the time spent processing emails by 50%.
*   **Privacy First**: Ensure user credentials and email data are handled securely without persistent server-side storage.
*   **Action-Oriented**: Focus on immediate actions (Reply, Archive, Delete) rather than just passive reading.
*   **Cost Effective**: Utilize efficient LLM inference (e.g., Llama 3 on Groq) to keep operational costs low.

## 4. Target Audience
*   **Busy Professionals**: Executives, managers, and developers who receive high volumes of email.
*   **Freelancers/Consultants**: Individuals managing multiple client communications.
*   **Productivity Enthusiasts**: Users looking to optimize their daily workflows.

## 5. Key Features (MVP)

### 5.1 Authentication
*   **Secure Login**: Users log in with Name, Gmail Address, and App Password.
*   **Session Management**: Credentials stored in encrypted, HTTP-only session cookies. No database storage of sensitive keys.

### 5.2 Dashboard & Inbox
*   **Unified View**: Clean interface displaying unread emails.
*   **Batch Options**: Smart detection of inbox size to offer "Triage All" or "Latest 100" processing.
*   **Filtering**: Filter view by AI-generated categories (Urgent, Work, Personal, Newsletter, Spam).

### 5.3 AI Intelligence
*   **Summarization**: Generate a 1-sentence summary of email content.
*   **Categorization**: Classify emails into predefined buckets:
    *   🔴 Urgent
    *   🔵 Work
    *   🟢 Personal
    *   🟣 Newsletter
    *   ⚪ Spam
*   **Action Recommendation**: Suggest the next best action (Reply, Archive, Delete).
*   **Smart Drafting**: Generate context-aware reply drafts for "Work" and "Personal" emails.

### 5.4 Technical Constraints
*   **Gmail Only**: MVP supports Google Mail (IMAP) only.
*   **Context Window**: Use ScaleDown to compress large email threads to fit within LLM context limits.

## 6. User Flow
1.  **Landing**: User arrives at public landing page (`/`).
2.  **Auth**: User enters Gmail credentials. System validates via IMAP handshake.
3.  **Triage**:
    *   System fetches unread emails.
    *   User selects "Triage Latest 100".
    *   System processes emails in parallel/sequence.
    *   Dashboard updates with categories and summaries.
4.  **Review**: User clicks an email, reads summary, copies draft response, and performs action on actual Gmail (manual for MVP, API automated in v2).

## 7. Future Roadmap (v2.0+)
*   **Automated Actions**: Button to execute "Archive" or "Delete" directly on Gmail server.
*   **Send Reply**: Button to send the drafted reply directly.
*   **Custom Rules**: User-defined instructions for the AI (e.g., "Always mark emails from @client.com as Urgent").
*   **Multi-Provider Support**: Outlook, Yahoo, and generic IMAP support.
*   **Local LLM Support**: Option to run Ollama locally for complete privacy.

## 8. Tech Stack
*   **Framework**: Next.js 15 (App Router)
*   **Styling**: Tailwind CSS
*   **AI Inference**: Groq API (Llama 3 70B / Mixtral 8x7B)
*   **Optimization**: ScaleDown (Prompt compression)
*   **Auth**: Iron Session (Stateless)
*   **Icons**: Lucide React
