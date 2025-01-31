import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'res.cloudinary.com'],
  },
  env: {
    PORT_BACKEND: process.env.PORT_BACKEND,
    PORT_FRONTEND: process.env.PORT_FRONTEND
  }
};


export default nextConfig;
