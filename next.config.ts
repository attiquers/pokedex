/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/**',
      },
      {
        protocol: 'https',
        hostname: 'img.pokemondb.net',
        pathname: '/artwork/**',
      },
    ],
  },
  reactStrictMode: false, // Turn off React strict mode
  typescript: {
    ignoreBuildErrors: true, // Bypass TS build errors
  },
  eslint: {
    ignoreDuringBuilds: true, // Skip ESLint errors during builds
  },
};

export default nextConfig;
