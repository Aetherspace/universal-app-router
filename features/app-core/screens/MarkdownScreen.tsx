import React from 'react'
import { StyleSheet, View } from 'react-native'
import { MDXStyles } from '@bacons/mdx'
import { Link } from '../navigation/Link' // @ts-ignore
import ReadMe from '../mdx/readme.mdx'

/* --- <MarkdownScreen/> --------------------------------------------------------------------------- */

const MarkdownScreen = () => {
  return (
    <View style={styles.container}>
        <Link
            href="/"
            style={{ ...styles.backButton, ...styles.link, textDecorationLine: 'none' }}
        >
            {`< Back`}
        </Link>
        <MDXStyles
            h1={styles.h1}
            h2={styles.h2}
            p={styles.p}
            li={styles.li}
            blockquote={styles.blockquote}
            a={styles.link}
        >
            <ReadMe />
        </MDXStyles>
    </View>
  )
}

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: 24,
    },
    backButton: {
        position: 'absolute',
        top: 16,
        left: 16,
    },
    subtitle: {
        marginTop: 8,
        marginBottom: 16,
        fontSize: 16,
        textAlign: 'center',
    },
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

export default MarkdownScreen
