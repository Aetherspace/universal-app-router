import type { AppProps } from 'next/app'
import React, { useEffect } from 'react'
import { useTheme } from 'nextra-theme-docs'
import { useColorScheme } from 'nativewind' // @ts-ignore
import UniversalAppProviders from '@app/screens/UniversalAppProviders'
import ServerStylesProvider from '@app/next/app/ServerStylesProvider'
import { ComponentDocsContextManager } from '@app/core/mdx/ComponentDocs'
import { Image as NextContextImage } from '@green-stack/components/Image.next'
import { Link as NextContextLink } from '@green-stack/navigation/Link.next'
import { useRouter as useNextContextRouter } from '@green-stack/navigation/useRouter.next'
import { useRouteParams as useNextRouteParams } from '@green-stack/navigation/useRouteParams.next'
import '@app/next/global.css'

export default function App({ Component, pageProps }: AppProps) {
    // Navigation
    const nextContextRouter = useNextContextRouter()

    // Styles
    const theme = useTheme()
    const scheme = useColorScheme()
    const resolvedTheme = theme.resolvedTheme || theme.systemTheme

    // -- Effects --

    useEffect(() => {
        // Figure out the theme and apply it
        const resolveTheme = () => {
            const storedTheme = localStorage.getItem('theme')
            let currentTheme = (resolvedTheme || storedTheme) as 'light' | 'dark' | 'system'
            if (currentTheme === 'system' || !currentTheme) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                const prefersDark = mediaQuery.media === '(prefers-color-scheme: dark)' && mediaQuery.matches
                currentTheme = prefersDark ? 'dark' : 'light'
            }
            theme.setTheme(currentTheme)
            scheme.setColorScheme(currentTheme)
        }
        // Hacky, but it works 🤷‍♂️ (listening for theme or scheme changes is unreliable, sadly)
        const queuedThemeCheck = () => {
            new Array(20).fill(null).forEach((_, idx) => setTimeout(resolveTheme, idx * 200))
        }
        // Attach listeners
        const $themeButtons = document.querySelectorAll('button[title="Change theme"]')
        $themeButtons.forEach($button => $button.addEventListener('click', queuedThemeCheck))
        // Trigger on mount or when theme changes
        resolveTheme()
        // Remove listeners
        return () => $themeButtons.forEach($button => {
            $button.removeEventListener('click', queuedThemeCheck)
        })
    }, [resolvedTheme])

    // -- Render --

    return (
        <UniversalAppProviders
            contextImage={NextContextImage}
            contextLink={NextContextLink}
            contextRouter={nextContextRouter}
            useContextRouteParams={useNextRouteParams}
            isNext
        >
            <ServerStylesProvider>
                <ComponentDocsContextManager>
                    <Component {...pageProps} />
                </ComponentDocsContextManager>
            </ServerStylesProvider>
        </UniversalAppProviders>
    )
}
