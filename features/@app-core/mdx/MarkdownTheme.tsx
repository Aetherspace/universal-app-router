import React from 'react'
import { StyleSheet } from 'react-native'
import { MarkdownImage } from './MarkdownImage'
import { MDXComponents } from '@bacons/mdx'
import { Link, View, Text, H1, H2, H3, P } from '../components/styled'
import './markdown.theme.css' // Duplicate of the React-Native styles from this file

/* --- Types -------------------------------------------------------------------------------------- */

type MarkdownThemeProps = {
    children: React.ReactNode
}

/* --- <MarkdownTheme/> --------------------------------------------------------------------------- */

const MarkdownTheme = ({ children }: MarkdownThemeProps) => {
  return (
        <View id="markdown-theme" className="flex flex-col flex-grow flex-shrink">
            <MDXComponents
                h1={(props) => <H1 className="mb-4" {...props} />}
                h2={(props) => <H2 className="mb-4" {...props} />}
                h3={(props) => <H3 className="mb-4" {...props} />}
                p={(props) => <P className="mb-4 leading-5" {...props} />}
                ul={(props) => <View className="p-0" {...props} />}
                li={(props) => <Text className="mb-4" {...props} />}
                blockquote={(props) => <View className="border-l-4 border-gray-300 text-base pl-4 pt-1 leading-6" {...props} />}
                a={(props) => <Link className="mt-4 text-base underline text-center max-w-full overflow-hidden" {...props} />}
                img={(props) => <MarkdownImage {...props} styles={styles.img} />}
            >
                {children}
            </MDXComponents>
        </View>
    )
}

/* --- Styles ---------------------------------------------------------------------------------- */
// -i- These styles won't work in Next.js for some reason, duplicate them in markdown.theme.css

const styles = StyleSheet.create({
    h1: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    h2: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    p: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 22,
    },
    ul: {
        padding: 0,
    },
    li: {
        fontSize: 16,
        marginBottom: 16,
        lineHeight: 22,
    },
    blockquote: {
        borderLeftColor: 'lightgray',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        fontSize: 16,
        paddingLeft: 16,
        paddingTop: 4,
        lineHeight: 22,
    },
    link: {
        marginTop: 16,
        fontSize: 16,
        color: '#93c5fd',
        textAlign: 'center',
        textDecorationLine: 'underline',
        maxWidth: '100%',
        overflow: 'hidden',
    },
    img: {
        maxWidth: '100%',
        marginTop: 16,
    }
})

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownTheme
