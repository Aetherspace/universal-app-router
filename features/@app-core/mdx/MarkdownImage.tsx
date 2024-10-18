import React, { useState, useEffect } from 'react'
import { Dimensions, Image as RNImage, LayoutChangeEvent } from 'react-native'
import { Image, View } from '@app/primitives'
import './markdown.theme.css' // Duplicate of the React-Native styles from this file
import { UniversalImageProps } from '@green-stack/components/Image.types'

/* --- <MarkdownImage/> --------------------------------------------------------------------------- */

export const MarkdownImage = (props: UniversalImageProps) => {
    // Props
    const { src, alt } = props
    
    // State
    const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 })
    const [wrapperWidth, setWrapperWidth] = useState(0)

    // Flags
    const hasWrapperWidth = !!wrapperWidth

    // Vars
    const imgRatio = imgDimensions.height / imgDimensions.width
    const maxWindowWidth = Dimensions.get('window').width
    const widthToUse = Math.round(Math.min(...[imgDimensions.width, wrapperWidth, maxWindowWidth].filter(Boolean)))
    const heightToUse = Math.round(widthToUse * imgRatio)
    const finalDimensions = imgRatio ? { width: widthToUse, height: heightToUse } : imgDimensions
    const wrapperKey = [src, finalDimensions.width, finalDimensions.height].join('-')

    // -- Handlers --

    const handleWrapperLayout = (event: LayoutChangeEvent) => {
        if (wrapperWidth < 5) setWrapperWidth(event.nativeEvent.layout.width)
    }

    // -- Effects --

    useEffect(() => {
        const checkImageDimensions = async () => {
            RNImage.getSize(src as string, (width, height) => {
                setImgDimensions({ width, height })
            })
        }
        if (typeof src === 'string') checkImageDimensions()
    }, [])

    // -- Render --

    return (
        <View
            key={wrapperKey}
            style={!hasWrapperWidth ? { minWidth: '100%', maxWidth: '100%' } : finalDimensions}
            className="relative flex flex-col"
            onLayout={!hasWrapperWidth ? handleWrapperLayout : undefined}
        >
            {hasWrapperWidth ? (
                <Image
                    key={`img-loaded-${wrapperKey}`}
                    alt={alt}
                    src={src}
                    style={finalDimensions}
                    contentFit="contain"
                />
            ) : (
                <Image
                    key={`img-loading-${wrapperKey}`}
                    className="android:opacity-0"
                    src={src}
                    style={finalDimensions}
                    contentFit="contain"
                />
            )}
        </View>
    )
}
