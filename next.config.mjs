/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL || process.env.BACKEND_GATEWAY_URL || 'http://localhost:8080',
  },
}

export default nextConfig

