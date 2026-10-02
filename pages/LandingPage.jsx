import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-black text-slate-950 text-xl tracking-tight">
            U
          </div>
          <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            UNLOAD
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200"
            onClick={() => alert('Authentication will be available in future releases.')}
          >
            Login
          </button>
          <button 
            type="button"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => alert('Onboarding will be available in future releases.')}
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-4xl mx-auto px-6 py-20 flex flex-col items-center text-center">
        {/* Safesprout Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Developed by Team Safesprout
        </div>

        {/* Main Title */}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white mb-4">
          UNLOAD
        </h1>

        {/* Subtitle */}
        <h2 className="text-xl sm:text-2xl font-semibold text-emerald-400 mb-6 tracking-wide">
          Digital Guardian & Screen Addiction Prevention
        </h2>

        {/* Tagline */}
        <p className="text-2xl sm:text-3xl text-slate-300 font-light italic max-w-2xl mb-12">
          &ldquo;Unload gradually. Live freely.&rdquo;
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-sm">
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-base shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => alert('Get Started button clicked!')}
          >
            Get Started
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-slate-700 hover:border-slate-500 bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 hover:text-white font-semibold text-base backdrop-blur transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            onClick={() => alert('Login button clicked!')}
          >
            Login
          </button>
        </div>

        {/* Core Concept Card */}
        <div className="mt-16 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 backdrop-blur-sm max-w-xl text-slate-400 text-sm leading-relaxed">
          <span className="text-slate-200 font-medium block mb-1">Progressive Unloading Philosophy</span>
          UNLOAD does not simply block screen usage. It gradually reduces excessive screen usage through a progressive unloading approach and encourages healthy self-regulation.
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} UNLOAD &bull; Developed by Team Safesprout. All rights reserved.
      </footer>
    </div>
  );
}
