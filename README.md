# 📧 Email Triage Assistant

An intelligent email management tool that uses AI (Groq/ScaleDown) to categorize, summarize, and draft responses for your Gmail inbox.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Features

- **🔐 Secure Authentication**: 
  - Login with your Name, Gmail Address, and App Password.
  - Credentials are stored securely in **HTTP-only cookies** (Iron Session) and represent your session. They are never saved to a database.
  
- **🤖 AI-Powered Triage**:
  - **Smart Summarization**: Get a one-sentence summary of every email.
  - **Auto-Categorization**: Sorts emails into *Urgent*, *Work*, *Personal*, *Newsletter*, or *Spam*.
  - **Action Recommendations**: AI suggests if you should *Reply*, *Archive*, or *Delete*.
  - **Draft Responses**: Automatically generating context-aware reply drafts.

- **🚀 Batch Processing**:
  - **Refined Workflow**: Upon login, choose to triage **All Emails** vs **Latest 100** depending on inbox size.
  - **Real-time Feedback**: "Thinking..." overlay keeps you informed of the AI's progress.

- **🖥️ Modern UI**:
  - Built with **Tailwind CSS** and **Lucide Icons** for a clean, responsive experience.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI/LLM**: Groq (Llama 3 / Mixtral) via ScaleDown (for context window management)
- **Auth**: Iron Session (Stateless, cookie-based)
- **Email**: `imap-simple` (Fetching), `nodemailer` (Sending - *planned*)

## 🚀 Getting Started

### Prerequisites

1.  **Node.js** (v18+)
2.  A **Gmail Account** with [2-Factor Authentication enabled](https://myaccount.google.com/signinoptions/two-step-verification).
3.  A **Gmail App Password** (Generate one [here](https://myaccount.google.com/apppasswords)).
4.  A **Groq API Key** (Get one from [Groq Console](https://console.groq.com/)).

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/PriyanshuKr-2027/email_triage.git
    cd email_triage
    ```

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Configure Environment Variables:
    Create a `.env.local` file in the root directory:

    ```env
    # AI Provider Keys
    GROQ_API_KEY=your_groq_api_key_here
    SCALEDOWN_API_KEY=your_scaledown_key_here

    # Security (Any random 32+ char string)
    SECRET_COOKIE_PASSWORD=complex_password_at_least_32_characters_long
    ```

    *Note: `GMAIL_USER` and `GMAIL_APP_PASSWORD` are provided by the user at login time.*

4.  Run the development server:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1.  **Landing Page**: Visit the home page and click "Get Started".
2.  **Login**: Enter your Name, Gmail Address, and the App Password you generated.
3.  **Dashboard**: 
    - You will see your unread emails.
    - If you have many emails, a prompt will ask if you want to triage them all or just the latest 100.
    - Click any email to view its AI-generated summary and draft response.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.
