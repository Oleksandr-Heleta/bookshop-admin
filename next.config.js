/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    images: {
        domains: [
            'mouse-admin.com.ua',
            'mouse-kidsbooks.com.ua',
            'res.cloudinary.com',
            'localhost'
        ]
    }
}

module.exports = nextConfig
