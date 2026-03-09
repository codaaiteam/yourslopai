/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' * blob: data: 'unsafe-inline' 'unsafe-eval';",
              "script-src 'self' * 'unsafe-inline' 'unsafe-eval';",
              "style-src 'self' * 'unsafe-inline';",
              "img-src 'self' * data: blob:;",
              "connect-src 'self' *;",
              "frame-src 'self' https://youraislopbores.me https://www.youraislopbores.me *;",
              "worker-src 'self' blob: *;",
              "child-src 'self' blob: *;",
              "font-src 'self' * data:;"
            ].join(' ')
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*'
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, OPTIONS'
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization'
          }
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  }
};

module.exports = nextConfig;
