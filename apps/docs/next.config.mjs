import { withExpo } from '@expo/next-adapter'
import nextra from 'nextra'

const withNextra = nextra({})

import mainNextConfig from '@app/next/next.config.base.cjs'

/** @type {import('next').NextConfig} */
const nextConfig = withNextra(withExpo(mainNextConfig))

export default nextConfig
