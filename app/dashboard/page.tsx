'use client';

import React, { useEffect, useState } from 'react';
import { Email, TriageResult } from '@/app/types';
import { Loader2, RefreshCw, Archive, Inbox, AlertTriangle, Briefcase, User, Mail, ShieldAlert, Sparkles, BrainCircuit, LogOut } from 'lucide-react';

type Category = 'All' | 'Urgent' | 'Work' | 'Personal' | 'Newsletter' | 'Spam';

export default function Dashboard() {
    const [emails, setEmails] = useState<Email[]>([]);
    const [loading, setLoading] = useState(true);
    const [triageResults, setTriageResults] = useState<Record<string, TriageResult>>({});
    const [processing, setProcessing] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category>('All');
    const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
    const [showBatchModal, setShowBatchModal] = useState(false);
    const [isBatchProcessing, setIsBatchProcessing] = useState(false);
    const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, message: '' });

    const fetchEmails = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/emails');
            const data = await res.json();
            if (data.emails) {
                setEmails(data.emails);
                // Trigger batch modal if we have emails and they aren't triaged
                if (data.emails.length > 0) {
                    setShowBatchModal(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch emails", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, []);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            window.location.href = '/login';
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const processBatch = async (limit: number | 'all') => {
        setShowBatchModal(false);
        setIsBatchProcessing(true);

        const emailsToProcess = limit === 'all'
            ? emails
            : emails.slice(0, typeof limit === 'number' ? limit : 100);

        setBatchProgress({ current: 0, total: emailsToProcess.length, message: 'Initializing AI...' });

        // Process sequentially to be nice to the API rate works better
        for (let i = 0; i < emailsToProcess.length; i++) {
            const email = emailsToProcess[i];

            // Skip if already triaged
            if (triageResults[email.id]) continue;

            setProcessing(email.id);
            // Dynamic loading messages
            const messages = [
                `Reading "${email.subject.substring(0, 20)}..."`,
                "Analyzing content...",
                "Drafting response...",
                "Categorizing...",
            ];
            setBatchProgress({
                current: i + 1,
                total: emailsToProcess.length,
                message: messages[i % messages.length]
            });

            try {
                const res = await fetch('/api/triage', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });
                const data = await res.json();
                if (data.result) {
                    setTriageResults(prev => ({ ...prev, [email.id]: data.result }));
                }
            } catch (error) {
                console.error("Failed to triage", error);
            }
        }

        setProcessing(null);
        setIsBatchProcessing(false);
    };

    const handleTriage = async (email: Email) => {
        if (triageResults[email.id]) {
            setSelectedEmailId(email.id);
            return;
        }

        setProcessing(email.id);
        try {
            const res = await fetch('/api/triage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();
            if (data.result) {
                setTriageResults(prev => ({ ...prev, [email.id]: data.result }));
                setSelectedEmailId(email.id);
            }
        } catch (error) {
            console.error("Failed to triage", error);
        } finally {
            setProcessing(null);
        }
    };

    // Filter emails based on selected category
    const filteredEmails = emails.filter(email => {
        if (selectedCategory === 'All') return true;
        const result = triageResults[email.id];
        if (!result) return false;
        return result.category === selectedCategory;
    });

    const categories: { name: Category; icon: React.ReactNode; color: string }[] = [
        { name: 'All', icon: <Inbox className="w-4 h-4" />, color: 'text-gray-600' },
        { name: 'Urgent', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-red-600' },
        { name: 'Work', icon: <Briefcase className="w-4 h-4" />, color: 'text-blue-600' },
        { name: 'Personal', icon: <User className="w-4 h-4" />, color: 'text-green-600' },
        { name: 'Newsletter', icon: <Mail className="w-4 h-4" />, color: 'text-purple-600' },
        { name: 'Spam', icon: <ShieldAlert className="w-4 h-4" />, color: 'text-gray-600' },
    ];

    const selectedResult = selectedEmailId ? triageResults[selectedEmailId] : null;

    if (isBatchProcessing) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
                <div className="w-24 h-24 mb-8 relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 animate-ping"></div>
                    <div className="absolute inset-4 bg-blue-500 rounded-full opacity-40 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <BrainCircuit className="w-10 h-10 text-blue-400" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Triage AI is thinking...</h2>
                <p className="text-gray-400 mb-8 text-lg animate-pulse">{batchProgress.message}</p>

                <div className="w-full max-w-md bg-gray-800 rounded-full h-4 overflow-hidden shadow-inner border border-gray-700">
                    <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300 ease-out"
                        style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-500 mt-4 font-mono">
                    Processed {batchProgress.current} / {batchProgress.total} emails
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">

            {/* Batch Modal */}
            {showBatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center border border-gray-100">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Triage?</h2>
                        <p className="text-gray-600 mb-8">
                            We found <span className="font-bold text-gray-900">{emails.length}</span> unread emails.
                            Shall we process all of them or just the latest?
                        </p>
                        <div className="grid gap-3">
                            {emails.length <= 100 ? (
                                <button
                                    onClick={() => processBatch('all')}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02]"
                                >
                                    ✨ Triage All {emails.length} Emails
                                </button>
                            ) : (
                                <button
                                    onClick={() => processBatch(100)}
                                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-200 transition-all transform hover:scale-[1.02]"
                                >
                                    ✨ Triage Latest 100 Emails
                                </button>
                            )}
                            <button
                                onClick={() => setShowBatchModal(false)}
                                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                            >
                                Skip for Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <h1 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Archive className="w-5 h-5 text-white" />
                        </div>
                        Triage AI
                    </h1>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {categories.map(cat => (
                        <button
                            key={cat.name}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${selectedCategory === cat.name
                                    ? 'bg-blue-50 text-blue-700'
                                    : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className={selectedCategory === cat.name ? 'text-blue-600' : 'text-gray-400'}>
                                {cat.icon}
                            </span>
                            {cat.name}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={fetchEmails}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Inbox
                    </button>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2 mt-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">

                {/* Email List */}
                <section className="w-80 lg:w-96 border-r border-gray-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="font-semibold text-gray-700">{selectedCategory}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{filteredEmails.length} messages</p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : filteredEmails.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <p className="text-sm">No emails in this view.</p>
                            </div>
                        ) : (
                            filteredEmails.map(email => (
                                <div
                                    key={email.id}
                                    onClick={() => handleTriage(email)}
                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedEmailId === email.id
                                            ? 'bg-blue-50 border-blue-200 shadow-sm'
                                            : 'bg-white border-transparent hover:bg-gray-50 border-b-gray-100'
                                        } ${processing === email.id ? 'opacity-70' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className={`text-sm font-medium line-clamp-1 ${selectedEmailId === email.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                            {email.subject || '(No Subject)'}
                                        </h3>
                                        {triageResults[email.id] && (
                                            <span className={`w-2 h-2 rounded-full ${getCategoryDotColor(triageResults[email.id].category)}`}></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                                        {email.snippet}
                                    </p>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-gray-400 truncate max-w-[120px]">{email.from}</span>
                                        <span className="text-[10px] text-gray-300">{new Date(email.date).toLocaleDateString()}</span>
                                    </div>
                                    {processing === email.id && (
                                        <div className="mt-2 h-0.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 animate-pulse w-2/3"></div>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Detail View */}
                <section className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                    {selectedEmailId && selectedResult ? (
                        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                            {/* Header */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getCategoryBadgeColor(selectedResult.category)}`}>
                                            {selectedResult.category}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            ID: {selectedResult.emailId}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">
                                        {emails.find(e => e.id === selectedEmailId)?.subject}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        From: {emails.find(e => e.id === selectedEmailId)?.from}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                                        Action: {selectedResult.action}
                                    </div>
                                </div>
                            </div>

                            {/* AI Summary */}
                            <div className="p-6 bg-blue-50/30">
                                <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                                    AI Summary
                                </h3>
                                <p className="text-gray-800 leading-relaxed text-sm">
                                    {selectedResult.summary}
                                </p>
                            </div>

                            {/* Suggested Response */}
                            {selectedResult.suggestedResponse && (
                                <div className="p-6">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Draft Response</h3>
                                    <div className="relative group">
                                        <textarea
                                            readOnly
                                            className="w-full h-48 p-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-0 outline-none resize-none font-mono"
                                            value={selectedResult.suggestedResponse}
                                        />
                                        <button
                                            onClick={() => navigator.clipboard.writeText(selectedResult.suggestedResponse!)}
                                            className="absolute top-2 right-2 px-3 py-1 bg-white border border-gray-200 shadow-sm text-xs font-medium text-gray-600 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Raw Data Toggle (Optional) */}
                            <div className="px-6 pb-6 pt-4 border-t border-gray-50">
                                <details className="group">
                                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-blue-600 flex items-center gap-1 font-medium select-none">
                                        <span>View Raw Email</span>
                                        <div className="h-px bg-gray-100 flex-1 ml-2 group-open:bg-transparent"></div>
                                    </summary>
                                    <div className="mt-4 p-4 bg-gray-800 text-gray-300 rounded-xl overflow-hidden shadow-inner border border-gray-700">
                                        <div className="flex gap-1.5 mb-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                                        </div>
                                        <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-2">
                                            {emails.find(e => e.id === selectedEmailId)?.body || emails.find(e => e.id === selectedEmailId)?.snippet}
                                        </pre>
                                    </div>
                                </details>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Mail className="w-8 h-8 text-gray-300" />
                            </div>
                            <p className="text-lg font-medium text-gray-500">Select an email to triage</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

function getCategoryBadgeColor(category: string) {
    switch (category) {
        case 'Urgent': return 'bg-red-100 text-red-700';
        case 'Work': return 'bg-blue-100 text-blue-700';
        case 'Personal': return 'bg-green-100 text-green-700';
        case 'Newsletter': return 'bg-purple-100 text-purple-700';
        case 'Spam': return 'bg-gray-100 text-gray-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function getCategoryDotColor(category: string) {
    switch (category) {
        case 'Urgent': return 'bg-red-500';
        case 'Work': return 'bg-blue-500';
        case 'Personal': return 'bg-green-500';
        case 'Newsletter': return 'bg-purple-500';
        case 'Spam': return 'bg-gray-500';
        default: return 'bg-gray-400';
    }
}
