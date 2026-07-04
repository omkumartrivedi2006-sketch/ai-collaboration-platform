import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Zap, Cpu, MessageSquare, Video, FileText, CheckCircle2, Users } from 'lucide-react';
import Button from '../components/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      {/* Header / Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-indigo-400 animate-pulse" />
            <span className="text-sm font-extrabold text-white tracking-widest uppercase">
              CollabSphere
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24 border-b border-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        {/* Glow orb */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 mb-6">
            <Zap className="h-3 w-3 fill-indigo-400" /> Platform Foundation Live
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-none">
            The Unified Workspace for <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Modern Enterprise Teams
            </span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Manage projects, stream conversations, coordinate tasks, and supercharge work with deep AI integrations. Securely built on an enterprise foundation.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto flex items-center gap-2 group">
                Create Free Account <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white">
                Learn More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Everything you need, in one place
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 font-medium">
            CollabSphere consolidates scattered workflows into a single interface. Access controls, workspaces, and team data securely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 text-indigo-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Enterprise Security</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Equipped with role authorization, JWT tokens, bcrypt encryption, Helmet headers, and API rate limiting out of the box.
            </p>
          </div>
          {/* Card 2 */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-10 w-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Role Management</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Structured roles for Admins, Managers, and Employees. Control access, restrict API routes, and customize layouts based on permissions.
            </p>
          </div>
          {/* Card 3 */}
          <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl flex flex-col gap-4">
            <div className="h-10 w-10 bg-pink-500/10 rounded-xl flex items-center justify-center border border-pink-500/20 text-pink-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Vibrant Architecture</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Fully decoupled components, Repository/Service patterns on the backend, and type-checked modular files for infinite scale.
            </p>
          </div>
        </div>
      </section>

      {/* Future AI Features Preview */}
      <section className="py-20 max-w-7xl mx-auto px-6 border-b border-slate-900">
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-900/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-48 w-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/15">
              Coming in Module 2
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight leading-tight">
              AI-Powered Collaboration Tools
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-4 font-medium leading-relaxed">
              Soon, you'll be able to query documents, generate task summaries, transcribe voice channels, and run predictive analytics on work metrics with deep LLM workflows.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Smart Task Seeding</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Let AI extract next steps from conversations.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Workspace Analytics</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated reports on milestones and velocity.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Testimonials Placeholders */}
      <section className="py-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 border-b border-slate-900">
        <div>
          <h3 className="text-xl font-extrabold text-white mb-6">Pricing Plans (Coming Soon)</h3>
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Starter Team</p>
                <p className="text-[10px] text-slate-400 mt-1">Up to 10 users, essential tools</p>
              </div>
              <span className="text-lg font-extrabold text-white">$0 <span className="text-[10px] text-slate-400 font-semibold">/mo</span></span>
            </div>
            <div className="h-px bg-slate-900" />
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-white">Growth Enterprise</p>
                <p className="text-[10px] text-slate-400 mt-1">Unlimited workspace, full AI modules</p>
              </div>
              <span className="text-lg font-extrabold text-indigo-400">$19 <span className="text-[10px] text-slate-400 font-semibold">/user/mo</span></span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-white mb-6">What Pioneers Say</h3>
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 flex flex-col gap-4">
            <p className="text-xs italic text-slate-300 leading-relaxed">
              "CollabSphere's foundation is built solid. The decoupled architecture and robust role permissions allowed our engineering team to confidently integrate customized tools seamlessly."
            </p>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs text-indigo-400 border border-slate-700">
                SC
              </div>
              <div>
                <p className="text-xs font-bold text-white">Sarah Connor</p>
                <p className="text-[10px] text-slate-500">Staff Systems Architect, Skynet Inc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-slate-600" />
            <span>© 2026 CollabSphere Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Contact Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
