import React, { useState, useEffect } from 'react'
import { StyleSheet, View, Dimensions, Image as RNImage, LayoutChangeEvent } from 'react-native'
import { Image } from '../components/Image'
import './markdown.theme.css' // Duplicate of the React-Native styles from this file
import { UniversalImageProps } from '../components/Image.types'

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
    const widthToUse = Math.min(...[imgDimensions.width, wrapperWidth, maxWindowWidth].filter(Boolean))
    const heightToUse = widthToUse * imgRatio
    const finalDimensions = imgRatio ? { width: widthToUse, height: heightToUse } : imgDimensions

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
            style={{
                ...styles.imgWrapper,
                ...(!hasWrapperWidth ? { minWidth: '100%' } : finalDimensions)
            }}
            onLayout={!hasWrapperWidth ? handleWrapperLayout : undefined}
        >
            <Image
                alt={alt}
                src={src}
                style={finalDimensions}
                contentFit="contain"
            />
        </View>
    )
}

/* --- Styles ---------------------------------------------------------------------------------- */
// -i- These styles won't work in Next.js for some reason, duplicate them in markdown.theme.css

const styles = StyleSheet.create({
    imgWrapper: {
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
        marginTop: 16,
    }
})
