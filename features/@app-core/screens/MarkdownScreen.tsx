import React from 'react'
import { ScrollView } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { View } from '../components/styled'
import MarkdownTheme from '../mdx/MarkdownTheme' // @ts-ignore
import ReadMe from '../mdx/readme.mdx'
import BackButton from '../components/BackButton'

/* --- <MarkdownScreen/> --------------------------------------------------------------------------- */

const MarkdownScreen = () => (
    <ScrollView>
        <StatusBar style="dark" />
        <View className="flex flex-col justify-center items-center bg-white">
            <View className="h-20 ios:h-24 android:h-24" />
            <View className="relative flex flex-col w-full items-start px-4 max-w-[600px]">
                <MarkdownTheme>
                    <ReadMe />
                </MarkdownTheme>
            </View>
            <View className="web:h-20" />
        </View>
        <BackButton
            backLink="/subpages/Universal%20Nav"
            color="#333333"
        />
    </ScrollView>
)

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownScreen
