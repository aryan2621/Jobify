/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@jobify/ui', '@jobify/domain', '@jobify/appwrite-server'],
};

export default nextConfig;
