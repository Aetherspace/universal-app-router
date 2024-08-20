import React from 'react'
import { StyleSheet, ScrollView, Dimensions } from 'react-native'
import { View } from '../components/styled'
import MarkdownTheme from '../mdx/MarkdownTheme' // @ts-ignore
import ReadMe from '../mdx/readme.mdx'
import BackButton from '../components/BackButton'

/* --- <MarkdownScreen/> --------------------------------------------------------------------------- */

const MarkdownScreen = () => (
    <ScrollView contentContainerStyle={styles.container}>
        <View className="flex flex-1 justify-center items-center bg-white">
            <BackButton
                backLink="/subpages/Universal%20Nav"
                color="#333333"
            />
            <View className="h-20 ios:h-40 android:h-40" />
            <View className="relative w-full items-start px-4 max-w-[600px]">
                <MarkdownTheme>
                    <ReadMe />
                </MarkdownTheme>
            </View>
            <View className="web:h-20" />
        </View>
    </ScrollView>
)

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainPage: {
        flex: 1,
        alignItems: 'center',
        padding: 24,
        minWidth: Math.min(600, Dimensions.get('window').width)
    },
})

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownScreen
