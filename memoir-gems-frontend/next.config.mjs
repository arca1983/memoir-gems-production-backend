/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'utfs.io' },
      { protocol: 'https', hostname: '**.uploadthing.com' },
      { protocol: 'https', hostname: 'cpqesgztpjjefkveitsm.supabase.co' },
    ],
  },
};

export default nextConfig;
