const { withExpo } = require("@expo/next-adapter");
const withMDX = require("@next/mdx")();

/** @type {import('next').NextConfig} */
const mainNextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: [
    "react-native",
    "react-native-web",
    "expo",
    "nativewind",
    "@bacons/mdx",
    "@bacons/react-views",
    "@expo/html-elements",
    // Add more React Native / Expo packages here...
  ],
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    forceSwcTransforms: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "codinsonn.dev",
      }
    ]
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = withMDX(withExpo(mainNextConfig));

module.exports = nextConfig;

module.exports.mainNextConfig = mainNextConfig;
