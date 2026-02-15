/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    eslint: {
        ignoreDuringBuilds: true,
    },
    productionBrowserSourceMaps: false,
}

module.exports = nextConfig
