import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */

const nextConfig: NextConfig = {
 images: {
    domains: ['raw.githubusercontent.com'], // This is the older way, still works for simpler cases
  },  
};

export default nextConfig;
