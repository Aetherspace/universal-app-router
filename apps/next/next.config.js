const { withExpo } = require("@expo/next-adapter");
const withMDX = require("@next/mdx")();

const mainNextConfig = require("./next.config.base");

/** @type {import('next').NextConfig} */
const nextConfig = withMDX(withExpo(mainNextConfig));

module.exports = nextConfig;
