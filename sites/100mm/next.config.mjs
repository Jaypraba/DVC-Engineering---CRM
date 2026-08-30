import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The repository root is the DVC CRM, which has its own lockfile. Pin tracing
  // here so Next does not walk up and pick the wrong workspace root.
  outputFileTracingRoot: here,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
