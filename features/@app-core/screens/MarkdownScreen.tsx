import React from 'react'
import { StyleSheet, ScrollView, Dimensions } from 'react-native'
import { View } from '../components/styled'
import MarkdownTheme from '../mdx/MarkdownTheme' // @ts-ignore
import ReadMe from '../mdx/readme.mdx'
import BackButton from '../components/BackButton'

/* --- <MarkdownScreen/> --------------------------------------------------------------------------- */

const MarkdownScreen = () => (
    <ScrollView>
        <View className="flex flex-col justify-center items-center bg-white">
            <BackButton
                backLink="/subpages/Universal%20Nav"
                color="#333333"
            />
            <View className="h-20 ios:h-24 android:h-24" />
            <View className="relative flex flex-col w-full items-start px-4 max-w-[600px]">
                <MarkdownTheme>
                    <ReadMe />
                </MarkdownTheme>
            </View>
            <View className="web:h-20" />
        </View>
    </ScrollView>
)

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownScreen
