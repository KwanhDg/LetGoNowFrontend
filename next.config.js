/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cgyhlofjyehlsrbntyma.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 