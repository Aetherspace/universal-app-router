import React from 'react'
import { useColorScheme } from 'nativewind'
import { StatusBar } from 'expo-status-bar'
import { View, ScrollView, getThemeColor } from '../components/styled'
import MarkdownTheme from '../mdx/MarkdownTheme' // @ts-ignore
import ReadMe from '@app/docs/pages/index.mdx'
import BackButton from '../components/BackButton'

/* --- <MarkdownScreen/> --------------------------------------------------------------------------- */

const MarkdownScreen = () => {
    
    // Theme
    const scheme = useColorScheme()

    // -- Render --

    return (
        <ScrollView className="bg-background">
            <StatusBar style={scheme.colorScheme === 'light' ? 'dark' : 'light'} />
            <View className="flex flex-col justify-center items-center bg-background">
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
                color={getThemeColor('--primary')}
            />
        </ScrollView>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default MarkdownScreen
