import React from 'react'
import { StyleSheet, View } from 'react-native'
import { Link } from '../navigation/Link' // @ts-ignore
import ReadMe from '../mdx/readme.mdx'
import MarkdownTheme from '../mdx/MarkdownTheme'

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
        <View style={styles.markdownWrapper}>
            <MarkdownTheme>
                <ReadMe />
            </MarkdownTheme>
        </View>
    </View>
  )
}

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    markdownWrapper: {
        width: '100%',
        position: 'relative',
        alignItems: 'flex-start',
        maxWidth: 600,
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
