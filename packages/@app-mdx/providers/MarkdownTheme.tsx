import React from 'react'
import { StyleSheet } from 'react-native'
import { MarkdownImage } from '../components/MarkdownImage'
import { MDXComponents } from '@bacons/mdx'
import { Link, View, Text, H1, H2, H3, P } from '@app/ui'
import '../markdown.theme.css'

/* --- Constants ------------------------------------------------------------------------------- */

const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined'
const isServer = typeof window === 'undefined'

/* --- Types ----------------------------------------------------------------------------------- */

type MarkdownThemeProps = {
    children: React.ReactNode
}

/* --- <MarkdownTheme/> ------------------------------------------------------------------------ */

export const MarkdownTheme = ({ children }: MarkdownThemeProps) => {
  return (
        <View id="markdown-theme" className="flex flex-col flex-grow flex-shrink">
            <MDXComponents
                components={{
                    h1: (props) => <H1 className="mb-4" {...props} />,
                    h2: (props) => <H2 className="mb-4" {...props} />,
                    h3: (props) => <H3 className="mb-4" {...props} />,
                    p: (props) => <P className="mb-4 leading-5" {...props} />,
                    ul: (props) => <View className="p-0" {...props} />,
                    li: (props) => <Text className="mb-4" {...props} />,
                    blockquote: (props) => (
                        <View
                            className="border-l-4 border-gray-300 text-base pl-4 pt-1 leading-6"
                            {...props}
                        />
                    ),
                    a: (props) => <Link className="mt-4 text-base underline text-center max-w-full overflow-hidden" target="_blank" {...props} />,
                    img: (props) => <MarkdownImage {...props} styles={styles.img} />,
                }}
            >
                {children}
            </MDXComponents>
        </View>
    )
}

/* --- Styles ---------------------------------------------------------------------------------- */

// -i- These styles won't work in Next.js for some reason, duplicate them in markdown.theme.css
const styles = StyleSheet.create({
    img: {
        maxWidth: '100%',
        marginTop: 16,
    }
})

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownTheme
