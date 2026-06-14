import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  reactStrictMode: true,
  i18n: {
    locales: ["en", "id"],
    defaultLocale: "en",
    localeDetection: false,
  },
};

export default nextConfig;
