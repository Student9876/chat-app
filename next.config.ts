import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', 'res.cloudinary.com', 'render.com', `${process.env.BACKEND_URL}`],
  },
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
    FRONTEND_URL: process.env.FRONTEND_URL
  }
};


export default nextConfig;
