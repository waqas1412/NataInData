import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We still want type checking, but we'll exclude the supabase functions
    ignoreBuildErrors: false,
  },
  // Exclude supabase function files from the build
  webpack: (config) => {
    config.externals = [...(config.externals || []), { 'supabase/functions': 'supabase/functions' }];
    return config;
  },
  /* config options here */
};

export default nextConfig;
