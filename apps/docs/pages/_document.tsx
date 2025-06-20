import Document, { Html, Head, Main, NextScript } from 'next/document'

/* --- Constants ------------------------------------------------------------------------------- */

const isProd = process.env.NODE_ENV === 'production'

/* --- <AppDocument/> -------------------------------------------------------------------------- */

class AppDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    {isProd && <base href="/docs/" />}
                    <style
                        id="nextra-style" dangerouslySetInnerHTML={{
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
                        }}
                    />
                    <meta property="og:site_name" content="FullProduct.dev" />
                    <meta property="og:image:type" content="image/png" />
                    <meta property="og:image:width" content="1200" />
                    <meta property="og:image:height" content="630" />
                    <meta property="og:image" content="https://fullproduct.dev/opengraph-image-1e9x92.png?191ba5e421ae85d7" />
                    <meta name="twitter:card" content="summary_large_image" />
                    <meta name="twitter:image:type" content="image/png" />
                    <meta name="twitter:image:width" content="1200" />
                    <meta name="twitter:image:height" content="628" />
                    <meta name="twitter:image" content="https://fullproduct.dev/twitter-image-1e9x92.png?1940f1afb1da528a" />
                    <link rel="icon" href="https://fullproduct.dev/favicon.ico" type="image/x-icon" sizes="16x16" />
                    <link rel="icon" href="https://fullproduct.dev/icon.png?b097a6b9e2a92ed6" type="image/png" sizes="180x180" />
                </Head>
                <body>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}

export default AppDocument
