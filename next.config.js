/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cgyhlofjyehlsrbntyma.supabase.co'],
  },
  experimental: {
    serverActions: true,
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
}

module.exports = nextConfig 