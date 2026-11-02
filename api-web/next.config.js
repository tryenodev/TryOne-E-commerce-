/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false,
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
