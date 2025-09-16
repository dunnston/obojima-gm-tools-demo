'use client';

import { useState } from 'react';
import {
  ComputerDesktopIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function LocalSetupPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'windows' | 'mac' | 'linux'>('overview');

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ComputerDesktopIcon className="h-12 w-12 text-emerald-400" />
            <h1 className="text-4xl font-bold">Local Installation</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get the full Obojima GM Tools experience with local installation - complete features, data control, and offline access.
          </p>
        </div>

        {/* Demo vs Local Comparison */}
        {isDemoMode && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Demo vs Local Installation</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Demo Mode */}
              <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                <div className="flex items-center gap-3 mb-4">
                  <CloudIcon className="h-8 w-8 text-blue-400" />
                  <h3 className="text-xl font-semibold">Demo Mode (Current)</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Add/edit items (localStorage)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Sample creatures & content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-sm">No image uploads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-sm">Data in browser only</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-400" />
                    <span className="text-sm">Limited content library</span>
                  </div>
                </div>
              </div>

              {/* Local Installation */}
              <div className="bg-emerald-700/20 rounded-xl p-6 border border-emerald-500/50">
                <div className="flex items-center gap-3 mb-4">
                  <ComputerDesktopIcon className="h-8 w-8 text-emerald-400" />
                  <h3 className="text-xl font-semibold">Local Installation</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Full creature database</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Upload custom images</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">SQLite database storage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Data backup & control</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Offline access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Control updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6">Why Install Locally?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <CogIcon className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-semibold">Full Control</h3>
              <p className="text-slate-300 text-sm">Control when to update, backup your data, and customize your experience</p>
            </div>
            <div className="text-center space-y-3">
              <DocumentTextIcon className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-semibold">Complete Content</h3>
              <p className="text-slate-300 text-sm">Access the full creature database and upload custom images</p>
            </div>
            <div className="text-center space-y-3">
              <ArrowDownTrayIcon className="h-12 w-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-semibold">Offline Ready</h3>
              <p className="text-slate-300 text-sm">Run your game sessions without internet dependency</p>
            </div>
          </div>
        </div>

        {/* Installation Tabs */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'overview', label: 'Quick Start' },
              { id: 'windows', label: 'Windows' },
              { id: 'mac', label: 'macOS' },
              { id: 'linux', label: 'Linux' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Quick Start Guide</h3>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Node.js 18+ installed on your system</li>
                    <li>Git (optional but recommended)</li>
                    <li>Basic command line knowledge</li>
                  </ul>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Installation Steps</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Download or clone the repository from GitHub</li>
                    <li>Install dependencies with <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>Start the development server with <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
                    <li>Open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code> in your browser</li>
                  </ol>
                </div>
                <div className="bg-emerald-700/20 rounded-lg p-4 border border-emerald-500/50">
                  <p className="text-emerald-200">
                    <strong>GitHub Repository:</strong>
                    <a
                      href="https://github.com/dunnston/obojima-gm-tools-demo"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline hover:text-emerald-100"
                    >
                      github.com/dunnston/obojima-gm-tools-demo
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'windows' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Windows Installation</h3>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 1: Install Node.js</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Visit <a href="https://nodejs.org" target="_blank" className="underline">nodejs.org</a></li>
                    <li>Download the LTS version for Windows</li>
                    <li>Run the installer and follow the prompts</li>
                    <li>Open Command Prompt and verify: <code className="bg-slate-800 px-2 py-1 rounded">node --version</code></li>
                  </ol>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 2: Download & Install</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Download the project from GitHub as a ZIP file</li>
                    <li>Extract to a folder (e.g., <code className="bg-slate-800 px-2 py-1 rounded">C:\\obojima-gm-tools</code>)</li>
                    <li>Open Command Prompt in that folder</li>
                    <li>Run: <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>Run: <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
                    <li>Open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mac' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">macOS Installation</h3>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 1: Install Node.js</h4>
                  <p className="text-slate-300 mb-2">Choose one method:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-1">Option A: Download</h5>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm">
                        <li>Visit <a href="https://nodejs.org" target="_blank" className="underline">nodejs.org</a></li>
                        <li>Download LTS for macOS</li>
                        <li>Run installer</li>
                      </ol>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Option B: Homebrew</h5>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm">
                        <li><code className="bg-slate-800 px-1 rounded text-xs">brew install node</code></li>
                      </ol>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 2: Download & Install</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Download project from GitHub or clone: <code className="bg-slate-800 px-2 py-1 rounded text-sm">git clone [repo-url]</code></li>
                    <li>Open Terminal in the project folder</li>
                    <li>Run: <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>Run: <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
                    <li>Open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'linux' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Linux Installation</h3>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 1: Install Node.js</h4>
                  <div className="space-y-2">
                    <p className="text-slate-300">Ubuntu/Debian:</p>
                    <code className="block bg-slate-800 px-3 py-2 rounded text-sm">
                      curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -<br/>
                      sudo apt-get install -y nodejs
                    </code>
                    <p className="text-slate-300 mt-3">CentOS/RHEL/Fedora:</p>
                    <code className="block bg-slate-800 px-3 py-2 rounded text-sm">
                      curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -<br/>
                      sudo dnf install -y nodejs npm
                    </code>
                  </div>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 2: Download & Install</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Clone repository: <code className="bg-slate-800 px-2 py-1 rounded text-sm">git clone [repo-url]</code></li>
                    <li>Navigate to folder: <code className="bg-slate-800 px-2 py-1 rounded text-sm">cd obojima-gm-tools</code></li>
                    <li>Install dependencies: <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>Start development server: <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
                    <li>Open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Troubleshooting */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Common Issues</h4>
              <div className="space-y-3 text-slate-300">
                <div>
                  <strong>Node.js version too old:</strong> Make sure you have Node.js 18 or higher
                </div>
                <div>
                  <strong>Port 3000 in use:</strong> The app will automatically try port 3001, 3002, etc.
                </div>
                <div>
                  <strong>Permission errors:</strong> On Windows, run Command Prompt as Administrator
                </div>
                <div>
                  <strong>Database issues:</strong> Delete the <code className="bg-slate-800 px-1 rounded">data/</code> folder and restart
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-emerald-100 mb-6">
            Install locally for the complete Obojima GM Tools experience
          </p>
          <a
            href="https://github.com/dunnston/obojima-gm-tools-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download from GitHub
          </a>
        </div>
      </div>
    </div>
  );
}