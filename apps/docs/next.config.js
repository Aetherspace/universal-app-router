const { withExpo } = require("@expo/next-adapter");
const withNextra = require("nextra")({
  theme: "nextra-theme-docs",
  themeConfig: "./docs.theme.js",
});

const mainNextConfig = require("@app/next/next.config").mainNextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = withNextra(withExpo(mainNextConfig));

module.exports = nextConfig;
