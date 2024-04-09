import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { MDXStyles, MDXComponents } from '@bacons/mdx'
import { Link } from '../navigation/Link'
import './markdown.theme.css' // Duplicate of the React-Native styles from this file

/* --- Types -------------------------------------------------------------------------------------- */

type MarkdownScreenProps = {
    children: React.ReactNode
}

/* --- <MarkdownTheme/> --------------------------------------------------------------------------- */

const MarkdownTheme = ({ children }: MarkdownScreenProps) => {
  return (
        <View nativeID="markdown-theme">
            <MDXStyles
                h1={styles.h1}
                h2={styles.h2}
                p={styles.p}
                ul={styles.ul}
                li={styles.li}
                blockquote={styles.blockquote}
                a={styles.link}
            >
                <MDXComponents
                    h1={(props) => <Text {...props} style={{ ...styles.h1 }} />}
                    h2={(props) => <Text {...props} style={{ ...styles.h2 }} />}
                    p={(props) => <Text {...props} style={{ ...styles.p }} />}
                    ul={(props) => <View {...props} style={{ ...styles.ul }} />}
                    li={(props) => <Text {...props} style={{ ...styles.li }} />}
                    blockquote={(props) => <View {...props} style={{ ...styles.blockquote }} />} // prettier-ignore
                    a={(props) => <Link {...props} style={{ ...styles.link }} />}
                >
                    {children}
                </MDXComponents>
            </MDXStyles>
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
        color: 'blue',
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
})

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownTheme
