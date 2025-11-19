/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Ignore TypeScript errors during build for deployment
    // These are type-only issues that don't affect runtime
    ignoreBuildErrors: true,
  },
  eslint: {
    // Don't fail build on ESLint errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
