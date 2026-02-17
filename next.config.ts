import type { NextConfig } from "next";

// Use static export only for Tauri builds, not for Vercel
const isStaticExport = process.env.TAURI_BUILD === 'true';

const nextConfig: NextConfig = {
  devIndicators: false,
  // Static export for Tauri desktop app only
  ...(isStaticExport && { output: 'export' }),
  eslint: {
    // Disable ESLint during builds to allow deployment
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during builds to allow deployment
    ignoreBuildErrors: true,
  },
  // Exclude Node.js-only modules from client bundle
  serverExternalPackages: ['better-sqlite3'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't bundle these modules on the client
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
      // Exclude better-sqlite3 completely from client bundle
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('better-sqlite3');
      }
    }
    return config;
  },
  // Required for static export
  ...(isStaticExport && { trailingSlash: true }),
  images: {
    // Disable Image Optimization for static export
    unoptimized: true,
    domains: ['drive.google.com', 'lh3.googleusercontent.com', 'lh4.googleusercontent.com', 'lh5.googleusercontent.com', 'lh6.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '/uc/**',
      },
      {
        protocol: 'https',
        hostname: 'lh*.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
