/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['puppeteer', 'sharp'],
  allowedDevOrigins: [
    'mirk.specs',
    'plrei.specs',
    'www.mirk.specs',
    'www.plrei.specs',
  ],
};

export default nextConfig;
