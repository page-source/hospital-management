/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  async rewrites() {
    return [
      {
        source: "/pht/v1/api/:slug*",
        destination: `${process.env.API_BASE_URL}/pht/v1/api/:slug*`,
      },
    ];
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
};

module.exports = nextConfig;
