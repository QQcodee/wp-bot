/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Ignores ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignores TypeScript errors during builds
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
