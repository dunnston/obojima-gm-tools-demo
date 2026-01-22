'use client';

import { useState } from 'react';
import {
  ComputerDesktopIcon,
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  CogIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

// GitHub Release URL
const WINDOWS_INSTALLER_URL = 'https://github.com/dunnston/obojima-gm-tools-demo/releases/download/v0.1.4/Obojima.GM.Tools_0.1.4_x64-setup.exe';
const WINDOWS_MSI_URL = 'https://github.com/dunnston/obojima-gm-tools-demo/releases/download/v0.1.4/Obojima.GM.Tools_0.1.4_x64_en-US.msi';

export default function LocalSetupPage() {
  const [activeTab, setActiveTab] = useState<'windows' | 'mac' | 'linux' | 'developer'>('windows');

  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <ComputerDesktopIcon className="h-12 w-12 text-emerald-400" />
            <h1 className="text-4xl font-bold">Download & Install</h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Get the full Obojima GM Tools experience with the desktop app - complete features, data control, and offline access.
          </p>
        </div>

        {/* Featured Download - Windows Desktop App */}
        <div className="bg-gradient-to-br from-emerald-700/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl border-2 border-emerald-500/50 p-8">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <ArrowDownTrayIcon className="h-10 w-10 text-emerald-400" />
              <h2 className="text-3xl font-bold">Download for Windows</h2>
            </div>
            <p className="text-lg text-emerald-100 max-w-2xl mx-auto">
              One-click installer - no technical setup required. Just download, install, and start managing your game!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={WINDOWS_INSTALLER_URL}
                className="inline-flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-emerald-500/25"
              >
                <ArrowDownTrayIcon className="h-6 w-6" />
                Download Installer (.exe)
              </a>
              <a
                href={WINDOWS_MSI_URL}
                className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                Alternative: MSI Package
              </a>
            </div>

            <div className="text-sm text-emerald-200/80">
              Version 0.1.4 | Windows 10/11 (64-bit) | ~160 MB
            </div>
          </div>
        </div>

        {/* Installation Steps for Windows */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h3 className="text-xl font-semibold mb-4">Installation Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-3">1</div>
              <h4 className="font-semibold mb-2">Download</h4>
              <p className="text-slate-300 text-sm">Click the download button above to get the installer</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-3">2</div>
              <h4 className="font-semibold mb-2">Install</h4>
              <p className="text-slate-300 text-sm">Run the installer and follow the prompts (may show "Unknown Publisher" warning)</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4 text-center">
              <div className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-3">3</div>
              <h4 className="font-semibold mb-2">Launch</h4>
              <p className="text-slate-300 text-sm">Open "Obojima GM Tools" from your Start Menu</p>
            </div>
          </div>

          <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
            <p className="text-amber-200 text-sm">
              <strong>Note:</strong> Windows may show a "Windows protected your PC" message. Click "More info" then "Run anyway" to proceed. This appears because the app isn't code-signed yet.
            </p>
          </div>
        </div>

        {/* Demo vs Local Comparison */}
        {isDemoMode && (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Demo vs Desktop App</h2>
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

              {/* Desktop App */}
              <div className="bg-emerald-700/20 rounded-xl p-6 border border-emerald-500/50">
                <div className="flex items-center gap-3 mb-4">
                  <ComputerDesktopIcon className="h-8 w-8 text-emerald-400" />
                  <h3 className="text-xl font-semibold">Desktop App</h3>
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
                    <span className="text-sm">Data backup & export</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">Offline access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-sm">No technical setup required</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits Section */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6">Desktop App Features</h2>
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

        {/* Other Platforms & Developer Setup */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold mb-4">Other Platforms & Developer Setup</h2>
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'windows', label: 'Windows (Dev)', icon: CommandLineIcon },
              { id: 'mac', label: 'macOS', icon: ComputerDesktopIcon },
              { id: 'linux', label: 'Linux', icon: ComputerDesktopIcon },
              { id: 'developer', label: 'Developer Setup', icon: CommandLineIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'windows' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Windows - Developer Setup</h3>
              <p className="text-slate-300">For developers who want to run from source code:</p>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 1: Install Node.js</h4>
                  <ol className="list-decimal list-inside space-y-1 text-slate-300">
                    <li>Visit <a href="https://nodejs.org" target="_blank" className="underline text-emerald-400">nodejs.org</a></li>
                    <li>Download the LTS version for Windows</li>
                    <li>Run the installer and follow the prompts</li>
                    <li>Open Command Prompt and verify: <code className="bg-slate-800 px-2 py-1 rounded">node --version</code></li>
                  </ol>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 2: Download & Install</h4>
                  <ol className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>Download the project from GitHub as a ZIP file</li>
                    <li>Extract to a folder (e.g., <code className="bg-slate-800 px-2 py-1 rounded">C:\obojima-gm-tools</code>)</li>
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
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <p className="text-amber-200 text-sm">
                  <strong>Note:</strong> A macOS desktop app is not yet available. For now, you can run from source code.
                </p>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Step 1: Install Node.js</h4>
                  <p className="text-slate-300 mb-2">Choose one method:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-1">Option A: Download</h5>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 text-sm">
                        <li>Visit <a href="https://nodejs.org" target="_blank" className="underline text-emerald-400">nodejs.org</a></li>
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
                    <li>Clone repository: <code className="bg-slate-800 px-2 py-1 rounded text-sm">git clone https://github.com/dunnston/obojima-gm-tools-demo</code></li>
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
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-4">
                <p className="text-amber-200 text-sm">
                  <strong>Note:</strong> A Linux desktop app is not yet available. For now, you can run from source code.
                </p>
              </div>
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
                    <li>Clone repository: <code className="bg-slate-800 px-2 py-1 rounded text-sm">git clone https://github.com/dunnston/obojima-gm-tools-demo</code></li>
                    <li>Navigate to folder: <code className="bg-slate-800 px-2 py-1 rounded text-sm">cd obojima-gm-tools</code></li>
                    <li>Install dependencies: <code className="bg-slate-800 px-2 py-1 rounded">npm install</code></li>
                    <li>Start development server: <code className="bg-slate-800 px-2 py-1 rounded">npm run dev</code></li>
                    <li>Open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code></li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'developer' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Developer Setup</h3>
              <p className="text-slate-300">For developers who want to contribute or customize the app:</p>
              <div className="space-y-4">
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Prerequisites</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-300">
                    <li>Node.js 18+ installed on your system</li>
                    <li>Git for version control</li>
                    <li>A code editor (VS Code recommended)</li>
                  </ul>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Clone & Run</h4>
                  <code className="block bg-slate-800 px-3 py-2 rounded text-sm mb-2">
                    git clone https://github.com/dunnston/obojima-gm-tools-demo<br/>
                    cd obojima-gm-tools<br/>
                    npm install<br/>
                    npm run dev
                  </code>
                  <p className="text-slate-300 text-sm mt-2">Then open <code className="bg-slate-800 px-2 py-1 rounded">http://localhost:3000</code></p>
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
        </div>

        {/* Troubleshooting */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
          <h2 className="text-2xl font-bold mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Desktop App Issues</h4>
              <div className="space-y-3 text-slate-300">
                <div>
                  <strong>"Windows protected your PC" message:</strong> Click "More info" then "Run anyway" - the app is safe but not yet code-signed
                </div>
                <div>
                  <strong>App won't start:</strong> Try running as Administrator, or reinstall the app
                </div>
                <div>
                  <strong>Data not saving:</strong> Check that you have write permissions to your user folder
                </div>
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Developer Setup Issues</h4>
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
