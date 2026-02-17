'use client';

import { BookOpenIcon, HeartIcon, CodeBracketIcon, GlobeAltIcon, SparklesIcon } from '@heroicons/react/24/outline';

export default function Credits() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Credits & Acknowledgments
          </h1>
          <p className="text-xl text-slate-300">
            Recognizing the amazing contributors who made this project possible
          </p>
        </div>

        {/* Credits Sections */}
        <div className="space-y-8">
          
          {/* Source Material */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <BookOpenIcon className="h-8 w-8 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Source Material</h2>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-xl p-6 border border-emerald-500/20">
                <h3 className="text-xl font-semibold text-emerald-400 mb-2">Obojima Book by 1985 Games</h3>
                <p className="text-slate-300 mb-3">
                  Source of ingredient, magic item, potion, and creature data. Original world setting and comprehensive lore.
                </p>
                <a 
                  href="https://obojima.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                >
                  <GlobeAltIcon className="h-4 w-4" />
                  Visit obojima.com
                </a>
              </div>
            </div>
          </div>

          {/* Inspiration & Data Sources */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <HeartIcon className="h-8 w-8 text-rose-400" />
              <h2 className="text-2xl font-bold text-white">Inspiration & Data Sources</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800/30 rounded-xl p-6 border border-rose-500/20">
                <h3 className="text-xl font-semibold text-rose-400 mb-2">weaverotales</h3>
                <p className="text-slate-300">
                  Inspiration and spreadsheet data contributions. Community support and valuable feedback throughout development.
                </p>
              </div>
              
              <div className="bg-slate-800/30 rounded-xl p-6 border border-rose-500/20">
                <h3 className="text-xl font-semibold text-rose-400 mb-2">ThorTheNinja</h3>
                <p className="text-slate-300">
                  Inspiration and spreadsheet data contributions. Data organization and structural improvements.
                </p>
              </div>
            </div>
          </div>

          {/* Application Creator */}
          <div className="bg-gradient-to-br from-violet-800/50 to-purple-700/50 backdrop-blur-xl rounded-2xl p-8 border border-violet-500/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <CodeBracketIcon className="h-8 w-8 text-violet-400" />
              <h2 className="text-2xl font-bold text-white">Application Creator</h2>
            </div>
            
            <div className="bg-slate-800/30 rounded-xl p-6 border border-violet-500/30 text-center">
              <h3 className="text-2xl font-bold text-violet-400 mb-2">Ryan Dunn</h3>
              <p className="text-lg text-violet-300 mb-2">Discord: 8 Bit Peach Boy</p>
              <a
                href="https://discord.gg/fA8MgQg5rs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors duration-200 mb-4"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Join the Community Discord
              </a>
              <p className="text-slate-300">
                Application developer and creator. Designed and built this comprehensive D&D Game Master toolkit
                to enhance tabletop gaming experiences.
              </p>
              <div className="mt-4 p-4 bg-violet-900/20 rounded-lg border border-violet-500/20">
                <p className="text-sm text-violet-200">
                  © 2025 Ryan Dunn. All rights reserved. This application may not be sold or claimed as another person's work.
                </p>
              </div>
            </div>
          </div>

          {/* Development */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <CodeBracketIcon className="h-8 w-8 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Technical Framework</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Application Framework</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Next.js - React framework</li>
                    <li>• React - UI library</li>
                    <li>• TypeScript - Type safety</li>
                    <li>• Tailwind CSS - Styling</li>
                    <li>• Heroicons - Icon library</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-slate-800/30 rounded-xl p-6 border border-blue-500/20">
                  <h3 className="text-lg font-semibold text-blue-400 mb-3">Gaming System</h3>
                  <ul className="space-y-2 text-slate-300">
                    <li>• Dungeons & Dragons 5th Edition</li>
                    <li>• Standard creature stat blocks</li>
                    <li>• Official game mechanics</li>
                    <li>• Combat and initiative systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* AI Disclosure */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-teal-900/30 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="h-8 w-8 text-cyan-400" />
              <h2 className="text-2xl font-bold text-white">AI Disclosure</h2>
            </div>

            <div className="space-y-4">
              <p className="text-slate-300">
                In the interest of transparency, the following AI tools were used during development:
              </p>

              <div className="bg-slate-800/30 rounded-xl p-4 border border-cyan-500/20">
                <h3 className="text-lg font-semibold text-cyan-400 mb-2">Development Tools</h3>
                <ul className="space-y-1 text-slate-300 text-sm">
                  <li>• Claude Code - AI coding assistant</li>
                  <li>• Cursor - AI-powered code editor</li>
                </ul>
              </div>

              <div className="bg-slate-800/40 rounded-lg p-4 border border-cyan-500/10 mt-4">
                <p className="text-sm text-cyan-200">
                  <strong>Note:</strong> No AI-generated content exists within the application itself.
                  All game data, descriptions, and lore are sourced from the official Obojima materials by 1985 Games.
                </p>
              </div>
            </div>
          </div>

          {/* Special Thanks */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <HeartIcon className="h-8 w-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Special Thanks</h2>
            </div>
            
            <div className="space-y-4 text-slate-300">
              <p>• <span className="text-purple-400 font-semibold">@manicfemme</span> for designing the application logo</p>
              <p>• <span className="text-purple-400 font-semibold">1985 Games</span> for creating the rich Obojima world and allowing use of their materials</p>
              <p>• <span className="text-purple-400 font-semibold">weaverotales</span> and <span className="text-purple-400 font-semibold">ThorTheNinja</span> for their invaluable data contributions and inspiration</p>
              <p>• <span className="text-purple-400 font-semibold">The D&D Community</span> for feedback and support during development</p>
              <p>• <span className="text-purple-400 font-semibold">Beta Testers</span> for helping improve the application</p>
              <p>• <span className="text-purple-400 font-semibold">Open Source Contributors</span> for the amazing tools that made this possible</p>
            </div>
          </div>

          {/* Legal Notice & Licensing */}
          <div className="bg-gradient-to-br from-amber-900/20 to-orange-900/20 backdrop-blur-xl rounded-2xl p-8 border border-amber-500/30 shadow-xl">
            <h2 className="text-xl font-bold text-amber-200 mb-4 text-center">Legal Notice & Licensing</h2>
            
            <div className="space-y-4 text-amber-100">
              <p className="text-center">
                <strong>Application Copyright:</strong> © 2025 Ryan Dunn (Discord: 8 Bit Peach Boy). All rights reserved.
              </p>
              
              <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-500/20">
                <p className="text-sm font-semibold text-amber-200 mb-2">Important License Terms:</p>
                <ul className="text-sm space-y-1">
                  <li>• This application may NOT be sold or used for commercial purposes</li>
                  <li>• You may NOT claim this application as your own work</li>
                  <li>• Free for personal tabletop gaming use only</li>
                  <li>• Redistribution requires permission from the creator</li>
                </ul>
              </div>
              
              <p className="text-center text-sm italic">
                This is a fan-made tool for enhancing tabletop gaming experiences. 
                Original Obojima content belongs to 1985 Games. D&D mechanics belong to Wizards of the Coast.
                Not affiliated with or endorsed by 1985 Games or Wizards of the Coast.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}