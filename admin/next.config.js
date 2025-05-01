/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost'],
  },
  // Configure shared assets
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(ico)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            publicPath: '/_next/static/assets',
            outputPath: 'static/assets',
          },
        },
      ],
    });
    return config;
  },
};

module.exports = nextConfig;
