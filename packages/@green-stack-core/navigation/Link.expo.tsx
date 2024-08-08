import type { KnownRoutes } from '@app/registries/routeManifest.generated'
import type { UniversalLinkProps } from './Link.types'
import { Link as ExpoLink } from 'expo-router'
import { parseNativeWindStyles } from '../styles/parseNativeWindStyles'

/* --- <Link/> --------------------------------------------------------------------------------- */

export const Link = <
    HREF extends KnownRoutes
>(props: UniversalLinkProps<HREF>) => {
    // Props
    const {
        children,
        href,
        params = {},
        style,
        replace,
        onPress,
        target,
        asChild,
        push,
        testID,
        nativeID,
        allowFontScaling,
        numberOfLines,
        maxFontSizeMultiplier,
        suppressHighlighting = true,
    } = props

    // -- Inject params? --

    const finalHref = Object.keys(params).reduce((acc, key) => {
        // Inject into [param] in href?
        const isRouteParam = acc.includes(`[${key}]`)
        if (isRouteParam) return acc.replace(`[${key}]`, params[key])
        // Inject as query param instead?
        return `${acc}${acc.includes('?') ? '&' : '?'}${key}=${params[key]}`
    }, href)

    // -- Nativewind --

    const { nativeWindStyles, restStyle } = parseNativeWindStyles(style)
    const finalStyle = { ...nativeWindStyles, ...restStyle }

    // -- Render --

    return (
        <ExpoLink
            href={finalHref}
            style={finalStyle}
            onPress={onPress}
            target={target}
            asChild={asChild}
            replace={replace}
            push={push}
            testID={testID}
            nativeID={nativeID}
            allowFontScaling={allowFontScaling}
            numberOfLines={numberOfLines}
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            suppressHighlighting={suppressHighlighting}
        >
            {children}
        </ExpoLink>
    )
}
