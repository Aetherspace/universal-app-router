import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { Banner, Head } from 'nextra/components'
import { getPageMap } from 'nextra/page-map'
import { createMetadata } from '@app/utils/server/metadata'
import { DocsProviders } from '../components/DocsProviders'
import { DocsFooterContent } from '../components/DocsFooterContent'
import { appConfig } from '@app/config'
import '../global.css'

/* --- Metadata -------------------------------------------------------------------------------- */

export const metadata = createMetadata({
    // TODO: Add a different title for your app's docs?
    title: `${(appConfig.title || appConfig.appName || 'FullProduct.dev')} Docs`,
    description: appConfig.description || appConfig.appDescription,
    openGraph: {
        title: appConfig.openGraph.title || appConfig.title || appConfig.appName,
        description: appConfig.openGraph.description || appConfig.description || appConfig.appDescription,
        url: appConfig.openGraph.url || appConfig.baseURL,
        siteName: appConfig.openGraph.siteName || appConfig.title || appConfig.appName,
    },
    // TODO: Override with your own icons?
    icons: {
        icon: [
            { url: 'https://fullproduct.dev/favicon.ico', type: 'image/x-icon', sizes: '16x16' },
            { url: 'https://fullproduct.dev/icon.png?b097a6b9e2a92ed6', type: 'image/png', sizes: '180x180' },
        ],
    },
})

/* --- Theme Components ------------------------------------------------------------------------ */

const banner = (
    <Banner storageKey="launch-announcement-2">
        <span className="font-bold">
            A custom banner
        </span>
    </Banner>
)

const navbar = (
    <Navbar
        logo={
            <div className="relative flex flex-row items-center">
                <img
                    className="rounded-md"
                    src="/green-stack-logo.png"
                    width="30"
                    height="30"
                />
                <div className="w-3"></div>
                <span><strong>FullProduct.dev</strong> ⚡️ Universal App Starter</span>
            </div>
        }
        logoLink="https://fullproduct.dev"
        projectLink="https://github.com/FullProduct-dev/green-stack-starter-demo?tab=readme-ov-file#built-with-fullproductdev-"
    />
)

const footer = (
    <Footer>
        <DocsFooterContent />
    </Footer>
)

/* --- <RootLayout/> --------------------------------------------------------------------------- */

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const pageMap = await getPageMap()
    return (
        <html lang="en" dir="ltr" suppressHydrationWarning>
            <Head>
                <link rel="stylesheet" href="/nextra-theme-docs.css" />
                <style dangerouslySetInnerHTML={{
                    __html: `
                        #docsTable {
                            --accent: 240, 4.8%, 95.9%;
                            --popover: 0, 0%, 100%;
                        }
                        .dark #docsTable {
                            --accent: 204, 100%, 76%, 0.1;
                            --popover: 0, 0%, 7%;
                        }
                    `,
                }} />
                <script
                    defer
                    data-website-id="dfid_CuEgxciqf5smDKfX32p3W"
                    data-domain="fullproduct.dev"
                    data-allow-localhost="true"
                    src="/js/sf/script.js"
                />
            </Head>
            <body>
                <Layout
                    banner={banner}
                    navbar={navbar}
                    pageMap={pageMap}
                    footer={footer}
                    docsRepositoryBase="https://github.com/FullProduct-dev/green-stack-starter-demo"
                    editLink={null}
                    feedback={{ content: null }}
                    sidebar={{
                        autoCollapse: true,
                        defaultMenuCollapseLevel: 1,
                        toggleButton: true,
                    }}
                    copyPageButton
                    navigation
                    darkMode
                >
                    <Suspense>
                        <DocsProviders>
                            {children}
                        </DocsProviders>
                    </Suspense>
                </Layout>
            </body>
        </html>
    )
}
