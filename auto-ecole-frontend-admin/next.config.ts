/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  images: {
    domains: ["localhost", "mon-domaine-future.com"],
    remotePatterns: [
      {
        protocol: "http", // ou "https" selon votre environnement
        hostname: "localhost",
        port: "8000", // Port de votre serveur Laravel
        pathname: "/storage/**", // Chemin où les images sont servies
      },
    ],
  },
};

export default nextConfig;