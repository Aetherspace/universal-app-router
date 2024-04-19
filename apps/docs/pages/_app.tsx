import UniversalAppProviders from '@app/core/screens/UniversalAppProviders'

export default function App({ Component, pageProps }) {
  return (
    <UniversalAppProviders>
      <Component {...pageProps} />
    </UniversalAppProviders>
  )
}
