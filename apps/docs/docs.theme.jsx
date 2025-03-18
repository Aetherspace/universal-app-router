import { useRouter } from 'next/router'

/* --- Theme ----------------------------------------------------------------------------------- */

/** @type {import('nextra-theme-docs').DocsThemeConfig} */
export default {
    logo: (
        <div className="relative flex flex-row items-center">
            <img
                className="rounded-md"
                src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgreen-stack-logo.b8051d21.png&w=128&q=75"
                width="30"
                height="30"
            />
            <div className="w-3"></div>
            <span><strong>FullProduct.dev</strong> ⚡️ Universal App Starter</span>
        </div>
    ),
    logoLink: 'https://fullproduct.dev',
    project: {
        link: 'https://github.com/Aetherspace/green-stack-starter-demo?tab=readme-ov-file#:Rr9ab:',
    },
    navigation: true,
    sidebar: {
        autoCollapse: true,
        defaultMenuCollapseLevel: 3,
        toggleButton: true,
    },
    docsRepositoryBase: 'https://github.com/Aetherspace/green-stack-starter-demo',
    editLink: {
        component: null,
    },
    darkMode: true,
    footer: {
        content: (
            <div className="flex w-full justify-center items-center bg-transparent">
                <div className="flex flex-col md:flex-row w-full max-w-[90rem] px-0 lg:px-8 justify-between">
                    <div className="flex flex-col max-w-[364px]">
                        <a 
                            className="text-link flex flex-row no-underline"
                            href="https://fullproduct.dev"
                        >
                            <div className="w-12 h-12">
                                <img
                                    alt="FullProduct.dev Starterkit Logo"
                                    loading="lazy"
                                    decoding="async"
                                    data-nimg="fill"
                                    className="w-full h-full"
                                    sizes="100vw"
                                    src="/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fgreen-stack-logo.b8051d21.png&amp;w=3840&amp;q=75"
                                    style={{
                                        height: '100%',
                                        width: '100%',
                                        inset: '0px',
                                        objectFit: 'cover',
                                        color: 'transparent',
                                    }}
                                />
                            </div>
                            <div className="w-3" />
                            <div className="flex flex-col justify-center h-12">
                                <div dir="auto" className="flex font-bold text-left text-primary text-lg">
                                    FullProduct.dev 🚀
                                </div>
                                <div dir="auto" className="flex text-left font-medium text-muted text-sm mt-[-3px]">
                                    Universal Base Starterkit
                                </div>
                            </div>
                        </a>
                        <div className="w-4 h-4" />
                        <a
                            className="text-link flex flex-row items-center no-underline h-10 bg-secondary-foreground max-w-[258px] px-4 rounded-lg"
                            target="_blank"
                            href="https://codinsonn.dev"
                        >
                            <div className="flex flex-row items-center">
                                <div className="flex flex-row h-10 items-center">
                                    <div dir="auto" className="flex text-sm text-secondary">
                                        By
                                    </div>
                                </div>
                                <div className="w-2" />
                                <div className="flex w-7 h-7" style={{ width: '28px', height: '28px' }}>
                                    <img
                                        alt="Thorr / codinsonn's Profile Picture"
                                        loading="lazy"
                                        decoding="async"
                                        className="flex rounded-full w-full h-full"
                                        src="https://codinsonn.dev/_next/image?url=%2Fimg%2FCodelyFansLogoPic160x160.jpeg&amp;w=256&amp;q=75"
                                        style={{
                                            height: '100%',
                                            width: '100%',
                                            inset: '0px',
                                            objectFit: 'cover',
                                            color: 'transparent',
                                        }}
                                    />
                                </div>
                                <div className="w-2" />
                                <div className="flex flex-row h-10 items-center">
                                    <div dir="auto" className="css-text-146c3p1 text-sm text-secondary font-bold">
                                        Thorr ⚡️ codinsonn.dev
                                    </div>
                                </div>
                            </div>
                        </a>
                        <div className="w-4 h-4" />
                        <div dir="auto" className="css-text-146c3p1 text-muted">
                            FullProduct.dev is a product of 'Aetherspace Digital' (registered in Belgium under 0757.590.784)
                        </div>
                        <div className="w-2 h-2" />
                        <div dir="auto" className="css-text-146c3p1 text-muted italic">
                            For support or inquiries, please <a className="text-link underline" href="mailto:info@fullproduct.dev">contact us</a>
                        </div>
                    </div>
                    <div className="h-12 md:h-0" />
                    <div className="flex flex-row">
                        <div className="flex flex-col">
                            <div dir="auto" className="css-text-146c3p1 text-primary font-bold text-lg">
                                The GREEN stack
                            </div>
                            <div className="h-2" />
                            <a className="underline text-muted" target="_blank" href="https://graphql.org/learn/">
                                GraphQL
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" target="_blank" href="https://18.react.dev/">
                                React
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" target="_blank" href="https://docs.expo.dev/">
                                Expo
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" target="_blank" href="https://nextjs.org/docs">
                                Next.js 
                            </a>
                            <div className="h-1" />
                        </div>
                        <div className="w-12" />
                        <div className="flex flex-col">
                            <div dir="auto" className="css-text-146c3p1 text-primary font-bold text-lg">
                                Product
                            </div>
                            <div className="h-2" />
                            <a className="underline text-muted" target="_blank" href="https://fullproduct.dev/docs">
                                Starterkit Docs
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" href="https://fullproduct.dev/sign-up">
                                Sign-Up
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" href="https://fullproduct.dev/sign-in">
                                Sign-In
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" href="https://fullproduct.dev/demos">
                                Demo
                            </a>
                            <div className="h-1" />
                        </div>
                        <div className="w-12" />
                        <div className="flex flex-col">
                            <div dir="auto" className="css-text-146c3p1 text-primary font-bold text-lg">
                                Legal
                            </div>
                            <div className="h-2" />
                            <a className="underline text-muted" href="https://fullproduct.dev/eula">
                                License Terms (EULA)
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" href="https://fullproduct.dev/privacy-policy">
                                Privacy Policy
                            </a>
                            <div className="h-1" />
                            <a className="underline text-muted" href="https://fullproduct.dev/cookie-policy">
                                Cookie Policy
                            </a>
                            <div className="h-1" />
                        </div>
                    </div>
                </div>
            </div>
        ),
    },
    useNextSeoProps() {
        const { asPath } = useRouter()
        if (asPath === '/') {
            return {
                title: 'FullProduct.dev ⚡️ Universal Base Starter',
            }
        } else if (asPath.includes('plugins')) {
            return {
                titleTemplate: 'FullProduct.dev ⚡️ %s Plugin - Universal Base Starter Docs',
            }
        }
        return {
            titleTemplate: 'FullProduct.dev | %s - Universal Base Starter Docs',
        }
    }
}
