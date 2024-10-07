'use client'
import { useState, createContext, useContext, useEffect, useRef } from 'react'
import { useTheme } from 'nextra-theme-docs'
import { z, Meta$Schema } from '@green-stack/schemas'
import { Pressable, View, Text, cn } from '@app/primitives'
import { useFormState } from '@green-stack/forms/useFormState'

/* --- Types ----------------------------------------------------------------------------------- */

export type ComponentDocsProps = {
    component: React.ComponentType<any>,
    docsConfig: {
        componentName: string,
        propSchema: z.ZodObject<z.ZodRawShape>,
        propMeta: Record<string, Meta$Schema>,
        previewProps: Record<string, any$Unknown>,
    }
}

export type ComponentDocsContext = {
    components: {
        [key: string]: ComponentDocsProps
    },
    setComponentDocs: (key: string, value: ComponentDocsProps) => void,
}

/* --- Context --------------------------------------------------------------------------------- */

export const ComponentDocsContext = createContext<ComponentDocsContext>({
    components: {},
    setComponentDocs: () => {},
})

export const useComponentDocsContext = () => useContext(ComponentDocsContext)

/* --- useComponentDocs() ---------------------------------------------------------------------- */

export const useComponentDocs = (props: ComponentDocsProps, syncInitialState = false) => {
    // Props
    const componentName = props.docsConfig.componentName! || props.component.displayName!

    // Context
    const { components, setComponentDocs } = useComponentDocsContext()
    const { component, docsConfig } = components[componentName] || props
    const { propSchema, propMeta, previewProps } = docsConfig

    // -- Handlers --

    const setPreviewProps = (newProps: Record<string, any$Unknown>) => {
        setComponentDocs(componentName, {
            component,
            docsConfig: {
                ...docsConfig,
                previewProps: {
                    ...docsConfig.previewProps,
                    ...newProps,
                },
            },
        })
    }

    // -- Effects --

    useEffect(() => {
        if (!syncInitialState) return
        const isRegistered = !!components[componentName]
        if (!isRegistered) setComponentDocs(componentName, { component, docsConfig })
    }, [])

    // -- Resources --

    return {
        component,
        docsConfig,
        componentName,
        propSchema,
        propMeta,
        previewProps,
        setPreviewProps,
    }
}

/* --- <ComponentDocsContextManager/> ---------------------------------------------------------- */

export const ComponentDocsContextManager = ({ children }: { children: React.ReactElement }) => {

    // State
    const [components, setComponents] = useState<ComponentDocsContext['components']>({})

    // -- Handlers --

    const setComponentDocs = (key: string, value: ComponentDocsProps) => {
        setComponents((prev) => ({ ...prev, [key]: value }))
    }

    // -- Render --

    return (
        <ComponentDocsContext.Provider value={{ components, setComponentDocs }}>
            {children}
        </ComponentDocsContext.Provider>
    )
}

/* --- <ComponentDocsPreview/> ----------------------------------------------------------------- */

export const ComponentDocsPreview = (props: ComponentDocsProps) => {
    // Props
    const { component: Component } = props

    // Context
    const docs = useComponentDocs(props)
    const { previewProps } = docs

    // State
    const [showCode, setShowCode] = useState(false)
    const [didCopy, setDidCopy] = useState(false)

    // -- Theme --

    const theme = useTheme()
    const resolvedTheme = (theme.resolvedTheme || theme.systemTheme) as 'light' | 'dark'

    const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(resolvedTheme)
    const [didMount, setDidMount] = useState(false)

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme')
        let currentTheme = (resolvedTheme || storedTheme) as 'light' | 'dark' | 'system'
        if (currentTheme === 'system' || !currentTheme) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const prefersDark = mediaQuery.media === '(prefers-color-scheme: dark)' && mediaQuery.matches
            currentTheme = prefersDark ? 'dark' : 'light'
        }
        if (colorScheme !== currentTheme) setColorScheme(currentTheme)
        setDidMount(true)
    }, [resolvedTheme])

    // -- Styles --

    const viewClassNames = cn(
        "relative min-w-400 min-h-200 p-12 rounded-xl border border-gray-500",
        showCode && 'rounded-b-none',
        didMount && colorScheme === 'light' && 'bg-slate-100',
        didMount && colorScheme === 'dark' && 'bg-zinc-900',
    )

    // -- Code --

    const jsxPropLines = Object.entries(previewProps).map(([key, value]) => {
        if (typeof value === 'string') return `${key}="${value}"`
        return `${key}={${JSON.stringify(value)}}`
    })
    const jsxCode = `<${docs.componentName}\n    ${jsxPropLines.join('\n    ')}\n/>`

    // -- Server Rendering --

    if (!didMount) return (
        <View
            className={cn(
                viewClassNames,
                'min-h-200 bg-slate-500 opacity-20 animate-pulse',
            )}
        />
    )

    // -- Client Rendering --

    return (
        <View>
            <View className={viewClassNames}>
                <Component {...previewProps} />
                <Pressable
                    className="absolute bottom-0 right-0 p-2 rounded-tl-md border-t border-l border-gray-500"
                    onPress={() => setShowCode((prev) => !prev)}
                >
                    <Text className="text-primary select-none">
                        {showCode ? 'Hide Code' : 'Show Code'}
                    </Text>
                </Pressable>
            </View>
            {showCode && (
                <View className="p-8 border border-t-0 border-gray-500 rounded-t-none rounded-b-xl bg-gray-800">
                    <pre className="text-xs text-white">
                        {jsxCode}
                    </pre>
                    <Pressable
                        className="absolute bottom-0 right-0 p-2 rounded-tl-md rounded-br-xl bg-zinc-900 border-t border-l border-gray-500"
                        onPress={() => { navigator.clipboard.writeText(jsxCode); setDidCopy(true); }}
                    >
                        <Text className="text-white select-none">
                            {didCopy ? 'Copied' : 'Copy Code'}
                        </Text>
                    </Pressable>
                </View>
            )}
        </View>
    )
}

/* --- <ComponentDocsPropTable/> --------------------------------------------------------------- */

export const ComponentDocsPropTable = (props: ComponentDocsProps) => {
    // Context
    const docsUtils = useComponentDocs(props, true)
    const { previewProps, propSchema, propMeta } = docsUtils

    // State
    const formState = useFormState(propSchema, { initialValues: previewProps })

    // -- Render --

    return (
        <View className="relative min-w-400 my-12">
            <pre>
                {JSON.stringify({
                    previewProps,       
                    formState,
                    propMeta,
                }, null, 4)}
            </pre>
        </View>
    )
}
