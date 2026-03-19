"use client"
import React, { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useColorScheme } from 'nativewind'
import { usePathname } from 'next/navigation'
import UniversalAppProviders from '@app/screens/UniversalAppProviders'
import ServerStylesProvider from '@app/next/app/ServerStylesProvider'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { ComponentDocsContextManager } from '@app/docs/components/ComponentDocs'
import { Image as NextContextImage } from '@green-stack/components/Image.next'
import { Link as NextContextLink } from '@green-stack/navigation/Link.next'
import { useRouter as useNextContextRouter } from '@green-stack/navigation/useRouter.next'
import { useRouteParams as useNextRouteParams } from '@green-stack/navigation/useRouteParams.next'
import { View, Image } from '@app/ui'

/* --- <DocsProviders/> ------------------------------------------------------------------------ */

export const DocsProviders = ({ children }: { children: React.ReactNode }) => {

    const nextContextRouter = useNextContextRouter()

    const theme = useTheme()
    const scheme = useColorScheme()
    const resolvedTheme = theme.resolvedTheme || theme.systemTheme

    // -- Theme Effects --

    useEffect(() => {
        const resolveTheme = () => {
            const storedTheme = localStorage.getItem('theme')
            let currentTheme = (resolvedTheme || storedTheme) as 'light' | 'dark' | 'system'
            if (currentTheme === 'system' || !currentTheme) {
                const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
                const prefersDark = mediaQuery.media === '(prefers-color-scheme: dark)' && mediaQuery.matches
                currentTheme = prefersDark ? 'dark' : 'light'
            }
            // theme.setTheme(currentTheme)
            scheme.setColorScheme(currentTheme)
        }
        const queuedThemeCheck = () => {
            window.scrollTo(0, 0)
            new Array(20).fill(null).forEach((_, idx) => setTimeout(resolveTheme, idx * 200))
        }
        const $themeButtons = document.querySelectorAll('button[title="Change theme"]')
        $themeButtons.forEach($button => $button.addEventListener('click', queuedThemeCheck))
        resolveTheme()
        return () => $themeButtons.forEach($button => {
            $button.removeEventListener('click', queuedThemeCheck)
        })
    }, [resolvedTheme])

    // -- Render --

    return (
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 0, height: 0 },
                insets: { top: 0, right: 0, bottom: 0, left: 0 },
            }}
        >
            <UniversalAppProviders
                contextImage={NextContextImage}
                contextLink={NextContextLink}
                contextRouter={nextContextRouter}
                useContextRouteParams={useNextRouteParams}
                isNext
            >
                <ServerStylesProvider>
                    <ComponentDocsContextManager>
                        <>
                            {children}
                        </>
                    </ComponentDocsContextManager>
                </ServerStylesProvider>
            </UniversalAppProviders>
        </SafeAreaProvider>
    )
}
