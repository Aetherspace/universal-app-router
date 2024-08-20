'use client'
import type { AppProps } from 'next/app'
import React from 'react'
import UniversalAppProviders from '@app/screens/UniversalAppProviders'
import { Image as NextContextImage } from '@green-stack/components/Image.next'
import { Link as NextContextLink } from '@green-stack/navigation/Link.next'
import { useRouter as useNextContextRouter } from '@green-stack/navigation/useRouter.next'
import { useRouteParams as useNextRouteParams } from '@green-stack/navigation/useRouteParams.next'

export default function App({ Component, pageProps }: AppProps) {
  // Navigation
  const nextContextRouter = useNextContextRouter()

  // -- Render --

  return (
    <UniversalAppProviders
        contextImage={NextContextImage}
        contextLink={NextContextLink}
        contextRouter={nextContextRouter}
        useContextRouteParams={useNextRouteParams}
        isNext
    >
      <Component {...pageProps} />
    </UniversalAppProviders>
  )
}
