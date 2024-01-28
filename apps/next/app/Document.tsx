import React from 'react'
import UniversalRootLayout from '@app/core/screens/UniversalRootLayout'
import ServerStylesProvider from './ServerStylesProvider'

// -i- This is a react server component
// -i- Use this file to set up your Next.js app's html skeleton
// -i- It's advised to also inject server side styles here for SSR

/* --- Styles ---------------------------------------------------------------------------------- */

// -i- Upgrade from the CSS reset that came with Expo's default Next.js setup
// Follows the setup for react-native-web:
// https://necolas.github.io/react-native-web/docs/setup/#root-element
// Plus additional React Native scroll and text parity styles for various browsers.
// Force Next-generated DOM elements to fill their parent's height
const cssReset = `
html, body, #__next {
  width: 100%;
  /* To smooth any scrolling behavior */
  -webkit-overflow-scrolling: touch;
  margin: 0px;
  padding: 0px;
  /* Allows content to fill the viewport and go beyond the bottom */
  min-height: 100%;
}
#__next {
  flex-shrink: 0;
  flex-basis: auto;
  flex-direction: column;
  flex-grow: 1;
  display: flex;
  flex: 1;
}
html {
  scroll-behavior: smooth;
  /* Prevent text size change on orientation change https://gist.github.com/tfausak/2222823#file-ios-8-web-app-html-L138 */
  -webkit-text-size-adjust: 100%;
  height: 100%;
}
body {
  display: flex;
  /* Allows you to scroll below the viewport; default value is visible */
  overflow-y: auto;
  overscroll-behavior-y: none;
  font-family: -apple-system, system, Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -ms-overflow-style: scrollbar;
}
`

/* --- <Document> ------------------------------------------------------------------------------ */

const Document = (props: { children: React.ReactNode }) => {
  // Props
  const { children } = props

  // -- Render --

  return (
    <html suppressHydrationWarning>
      <head>
        {/* - Title & Keywords - */}
        <title>Universal App Router</title>
        {/* - Styling - */}
        <ServerStylesProvider>{children}</ServerStylesProvider>
        <style type="text/css" dangerouslySetInnerHTML={{ __html: cssReset }} />
        {/* - Other - */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <UniversalRootLayout>{children}</UniversalRootLayout>
      </body>
    </html>
  )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default Document
