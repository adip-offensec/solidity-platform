/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["solc"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("solc");
    }
    return config;
  },
};

module.exports = nextConfig;
