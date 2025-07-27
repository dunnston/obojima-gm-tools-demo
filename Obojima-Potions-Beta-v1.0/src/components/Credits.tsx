'use client';

import { BookOpenIcon, HeartIcon, CodeBracketIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

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
              <p className="text-lg text-violet-300 mb-4">Discord: 8 Bit Peach Boy</p>
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

          {/* Special Thanks */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <HeartIcon className="h-8 w-8 text-purple-400" />
              <h2 className="text-2xl font-bold text-white">Special Thanks</h2>
            </div>
            
            <div className="space-y-4 text-slate-300">
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