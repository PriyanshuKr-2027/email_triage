import Link from 'next/link';
import { ArrowRight, Mail, Shield, Zap, CheckCircle } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Mail className="w-5 h-5 text-white" />
          </div>
          Triage AI
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign In
          </Link>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
              Tame your inbox with <span className="text-blue-600">AI intelligence</span>.
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
              Stop drowning in emails. Triage AI automatically categorizes, summarizes, and drafts responses for your most important messages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/login" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg shadow-blue-200"
              >
                Start Triaging Now
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="#features" 
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-900 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                View Demo
              </Link>
            </div>
            
            <div className="flex items-center gap-6 pt-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Secure & Private</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Runs Locally</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Powered by Groq</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full filter blur-3xl opacity-30"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-2 transform rotate-2 hover:rotate-0 transition-transform duration-500">
               <img 
                src="https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&q=80&w=2070" 
                alt="Dashboard Preview" 
                className="rounded-xl shadow-inner border border-gray-100"
              />
              {/* Optional: Replace with actual screenshot of your app later */}
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why use Triage AI?</h2>
            <p className="text-gray-600">Built for speed and privacy. Your emails never leave your session storage until you say so.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-yellow-500" />,
                title: "Lightning Fast",
                desc: "Powered by Groq's LPU™ Inference Engine for instant email analysis."
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-500" />,
                title: "Secure by Design",
                desc: "Your credentials are encrypted in your browser session. We don't store them."
              },
              {
                icon: <Mail className="w-6 h-6 text-purple-500" />,
                title: "Smart Actions",
                desc: "Auto-drafts replies and archives spam so you can focus on deep work."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500">
          <p>© 2026 Triage AI. Built with Next.js & Groq.</p>
        </div>
      </footer>
    </div>
  );
}
