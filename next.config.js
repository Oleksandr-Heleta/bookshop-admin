/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: [
            'res.cloudinary.com',
            'localhost'
        ]
    }
}

module.exports = nextConfig
