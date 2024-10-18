'use client'
import { useState, createContext, useContext, useEffect, useMemo } from 'react'
import { useTheme } from 'nextra-theme-docs'
import { useRouter } from 'next/router'
import { buildUrlParamsObject, createKey, parseUrlParamsObject } from '@green-stack/utils/objectUtils'
import { DocumentationProps} from '@green-stack/schemas'
import { Pressable, View, Text, cn, getThemeColor } from '@app/primitives'
import { useFormState } from '@green-stack/forms/useFormState'
import { Button } from '@app/docs/components/Button.docs'
import { Checkbox } from '@app/docs/components/Checkbox.docs'
import { TextInput } from '@app/docs/components/TextInput.docs'
import { Select } from '@app/docs/components/Select.docs'
import { TextArea } from '@app/docs/components/TextArea.docs'
import { Switch } from '@app/docs/components/Switch.docs'
import { NumberStepper } from '@app/docs/components/NumberStepper.docs'
import { isEmpty } from '@green-stack/utils/commonUtils'
import { Icon } from '@green-stack/components/Icon'

/* --- Types ----------------------------------------------------------------------------------- */

export type ComponentDocsProps = {
    component: React.ComponentType<any>,
    docsConfig: DocumentationProps
}

export type ComponentDocsContext = {
    components: { [key: string]: ComponentDocsProps },
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
    // Nav
    const router = useRouter()
    const params = parseUrlParamsObject(router.query)

    // Props
    const componentName = props.docsConfig.componentName! || props.component.displayName!
    
    // Context
    const { components, setComponentDocs } = useComponentDocsContext()
    const componentData = components[componentName]
    const { component, docsConfig } = componentData || props
    const { propSchema, propMeta, previewProps, previewState } = docsConfig
    const { valueProp = 'value', onChangeProp = 'onChange' } = docsConfig
    const { didMount, didApplyParams, didRegister } = previewState || {}

    // Flags
    const hasParams = !isEmpty(params)
    const isReady = didMount && didRegister && didApplyParams
    const applyParams = hasParams && isReady

    // Vars
    const currentVal = applyParams ? params[valueProp] : previewProps[valueProp]
    const valueField = { [valueProp]: currentVal || propMeta[valueProp]?.defaultValue }

    // -- Handlers --

    const setPreviewProps = (newProps: Record<string, any$Unknown>) => {
        setComponentDocs(componentName, {
            component,
            docsConfig: {
                ...docsConfig,
                ...componentData?.docsConfig,
                previewProps: {
                    ...docsConfig.previewProps,
                    ...componentData?.docsConfig.previewProps,
                    ...params,
                    ...newProps,
                },
                previewState: {
                    ...docsConfig.previewState,
                    ...componentData?.docsConfig?.previewState,
                    didRegister: true,
                }
            },
        })
    }

    const setPreviewState = (newState: DocumentationProps['previewState']) => {
        setComponentDocs(componentName, {
            component,
            docsConfig: {
                ...docsConfig,
                ...componentData?.docsConfig,
                previewState: {
                    ...docsConfig.previewState,
                    ...componentData?.docsConfig.previewState,
                    ...newState,
                },
            },
        })
    }

    const setDidApplyParams = (value: boolean) => setTimeout(() => setPreviewState({ didApplyParams: value }), 20)

    const setDidMount = (value: boolean) => setTimeout(() => setPreviewState({ didMount: value }), 10)

    // -- Effects --

    useEffect(() => {
        if (!syncInitialState) return
        const isRegistered = !!components[componentName]
        if (!isRegistered) setComponentDocs(componentName, { component, docsConfig })
        // Auto render after 1s
        setTimeout(() => setPreviewState({
            didMount: true,
            didApplyParams: true,
            didRegister: true,
        }), 1000)
    }, [])

    // -- Resources --

    return {
        component,
        docsConfig,
        componentName,
        propSchema,
        propMeta,
        previewProps: {
            ...previewProps,
            ...params,
            ...valueField,
        },
        previewState,
        valueProp,
        onChangeProp,
        router,
        params,
        valueField,
        setPreviewProps,
        setDidMount,
        setDidApplyParams,
        hasParams,
        didMount: !!didMount,
        didApplyParams: !!didApplyParams,
        isReady,
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
    const docsUtils = useComponentDocs(props)
    const { componentName, previewProps, didMount, isReady, setDidMount } = docsUtils

    // State
    const [showCode, setShowCode] = useState(false)
    const [didCopy, setDidCopy] = useState(false)
    
    // -- Theme --
    
    const theme = useTheme()
    const resolvedTheme = (theme.resolvedTheme || theme.systemTheme) as 'light' | 'dark'
    const [colorScheme, setColorScheme] = useState<'light' | 'dark' | undefined>(resolvedTheme)

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
        'relative min-w-400 min-h-200 p-12 rounded-xl border border-gray-500',
        showCode && 'rounded-b-none',
        didMount && colorScheme === 'light' && 'bg-background',
        didMount && colorScheme === 'dark' && 'bg-zinc-900',
    )

    // -- Handlers --

    const previewPropsWithHandlers = useMemo(() => {
        const onChange = (value: any$Unknown) => {
            const newValue = { [docsUtils.valueProp]: isEmpty(value) ? "" : value }
            const newParams = { ...docsUtils.params, ...newValue }
            const query = buildUrlParamsObject(newParams)
            docsUtils.router.push({ query }, undefined, { shallow: true })
        }
        return {
            ...previewProps,
            [docsUtils.onChangeProp]: onChange,
        }
    }, [createKey(previewProps || props.docsConfig.previewProps)])

    // -- Code --

    const jsxPropLines = Object.entries(previewProps).map(([key, value]) => {
        if (typeof value === 'string') return `${key}="${value}"`
        if (typeof value === 'undefined') return null
        let strValue = JSON.stringify(value)
        if (Array.isArray(value)) strValue = strValue.replaceAll(',', ', ')
        if (strValue.length > 42) strValue = JSON.stringify(value, null, 4).split('\n').join('\n    ')
        return `${key}={${strValue}}`
    }).filter(Boolean) as string[]

    const jsxCode = `<${componentName}\n    ${jsxPropLines.join('\n    ')}\n/>`

    // -- Server Rendering --

    if (!isReady) return (
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
                <Component {...previewPropsWithHandlers} />
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
    const { previewProps, propSchema, propMeta, router, params, } = docsUtils
    const { didMount, didApplyParams, isReady, hasParams, setDidApplyParams } = docsUtils

    // Props
    const defaultProps = useMemo(() => props.docsConfig.previewProps, [])
    const defaultPropsKey = useMemo(() => createKey(defaultProps), [])
    useEffect(() => console.log('Default props changed'), [defaultPropsKey])
    
    // State
    const [timesReset, setTimesReset] = useState(0)
    const [isResetting, setIsResetting] = useState(false)
    const initialValues = { ...previewProps, ...params }
    const syncFromPropsKey = createKey(initialValues)
    const formState = useFormState(propSchema, { initialValues, syncFromPropsKey })
    
    // Theme
    const theme = useTheme()
    const resolvedTheme = (theme.resolvedTheme || theme.systemTheme) as 'light' | 'dark'
    
    // Flags
    const isDefaultState = formState.valuesKey === defaultPropsKey
    const showResetButton = !isDefaultState || isResetting

    // -- Handlers --

    const handleReset = () => {
        formState.setValues(defaultProps)
        setTimesReset((prev) => prev + 1)
        setIsResetting(true)
        setTimeout(() => setIsResetting(false), 1500)
    }

    // -- Sync --

    useEffect(() => {
        if (!didMount) return
        const initialState = { ...previewProps, ...params }
        if (!isReady && hasParams) formState.setValues(initialState)
        if (!isReady && hasParams) docsUtils.setPreviewProps(initialState)
        if (!isReady && didMount) setDidApplyParams(true)
    }, [hasParams, didMount, didApplyParams])

    useEffect(() => {
        docsUtils.setPreviewProps(formState.values)
        if (isReady) {
            const query = buildUrlParamsObject(formState.values)
            router.push({ query }, undefined, { shallow: true })
        }
    }, [formState.valuesKey, hasParams, didMount, isReady])

    // -- Render --

    return (
        <View className="relative min-w-400 my-12">

            {/* - Column Headings - */}

            <View className="flex flex-row">
                <View className="flex w-1/5 max-w-[150px] items-start px-2 pl-4">
                    <Text className="text-base font-bold text-primary">
                        Name
                    </Text>
                </View>
                <View className="flex w-2/5 min-w-[200px] flex-grow flex-shrink items-start px-2">
                    <Text className="text-base font-bold text-primary">
                        Description
                    </Text>
                </View>
                <View 
                    className={cn(
                        'w-1/5 max-w-[150px] items-start px-2',
                        'hidden lg:flex',
                    )}
                >
                    <Text className="text-base font-bold text-primary">
                        Default
                    </Text>
                </View>
                <View className="flex flex-row w-1/5 min-w-[200px] flex-grow items-center justify-between px-2">
                    <Text className="text-base font-bold text-primary">
                        Preview
                    </Text>
                    {showResetButton && (
                        <Pressable
                            className={cn(
                                'relative flex items-center py-1 px-3 rounded-md border border-info',
                                isResetting && 'animate-pulse',
                            )}
                            onPress={handleReset}
                        >
                            <Icon name="UndoFilled" color={getThemeColor('--info')} size={10} />
                        </Pressable>
                    )}
                </View>
            </View>
            <View className="h-4" />

            {/* - Props Table - */}

            <View className="flex flex-col rounded-xl border border-gray-500">
                {Object.entries(propMeta).map(([key, meta], idx) => {
                    // Flags
                    const isLastItem = idx === Object.keys(propMeta).length - 1
                    const isRequired = !meta.isOptional && !meta.isNullable
                    const isArray = meta.baseType === 'Array' || meta.zodType === 'ZodArray'
                    const isObject = meta.baseType === 'Object' || meta.zodType === 'ZodObject'
                    const isJsonInput = isArray || isObject
                    // Metadata
                    const defaultValue = meta.defaultValue && JSON.stringify(meta.defaultValue)
                    const currentValue = formState.values[key]
                    const description = meta.description
                    // Determine field and input type
                    let fieldType = meta.baseType?.toLowerCase() // @ts-ignore
                    let subType = !isArray ? '' : meta.schema?.baseType?.toLowerCase()
                    if (meta.zodType === 'ZodEnum') fieldType = 'enum'
                    if (isArray && subType) fieldType = `[${subType}]`
                    if (isObject && meta.name) fieldType = meta.name
                    // Recreate component if theme changes
                    const inputKey = `${key}-${[resolvedTheme, didMount, timesReset].filter(Boolean).join('-')}`
                    const jsonInputKey = Array.isArray(currentValue) ? createKey({ inputKey, currentValue }) : inputKey
                    // Render table row
                    return (
                        <View
                            key={`props-table-${key}`}
                            className={cn(
                                'flex flex-row w-full py-4',
                                !isLastItem && 'border-b border-gray-500',
                            )}
                        >
                            
                            {/* - Title - */}

                            <View className="flex w-1/5 max-w-[150px] items-start px-2 pl-4">
                                <Text className="text-xs font-bold text-primary">
                                    {key}
                                    {isRequired && (
                                        <Text className="text-xs text-danger">
                                            {' *'}
                                        </Text>
                                    )}
                                </Text>
                            </View>

                            {/* - Description - */}

                            <View className="flex w-2/5 min-w-[200px] flex-grow flex-shrink items-start px-2">
                                {!!description && (
                                    <Text className={cn("text-xs text-primary", !!fieldType && 'mb-2')}>
                                        {description}
                                    </Text>
                                )}
                                {fieldType && (
                                    <Text className="text-xs px-2 py-1 rounded-md bg-secondary-inverse text-secondary">
                                        {`${fieldType}`}
                                    </Text>
                                )}
                            </View>

                            {/* - Defaults - */}

                            <View 
                                className={cn(
                                    'w-1/5 max-w-[150px] items-start px-2',
                                    'hidden lg:flex',
                                )}
                            >
                               {defaultValue ? (
                                    <Text className="text-xs px-2 py-1 rounded-md bg-secondary-inverse text-secondary">
                                        {defaultValue}
                                    </Text>
                               ) : (
                                    <Text className="text-xs text-primary">
                                        -
                                    </Text>
                               )}
                            </View>

                            {/* - Preview Inputs - */}

                            <View className="flex w-1/5 min-w-[200px] flex-grow items-start px-2 pr-4">
                                
                                {fieldType === 'boolean' && isReady && (
                                    <Switch
                                        key={inputKey}
                                        checked={currentValue}
                                        onCheckedChange={(value) => formState.setValue(key, value)}
                                    />
                                )}

                                {fieldType === 'string' && isReady && (
                                    <TextInput
                                        key={inputKey}
                                        {...formState.getTextInputProps(key)}
                                    />
                                )}

                                {fieldType === 'number' && isReady && (
                                    <NumberStepper
                                        key={inputKey}
                                        {...formState.getInputProps(key)}
                                        min={meta.minValue}
                                        max={meta.maxValue}
                                    />
                                )}

                                {fieldType === 'enum' && isReady && (
                                    <Select
                                        key={inputKey}
                                        {...formState.getInputProps(key)}
                                        value={currentValue || undefined}
                                        required={isRequired}
                                    >
                                        {!isRequired && (
                                            <Select.Option
                                                key="null" // @ts-ignore
                                                value={null}
                                                label="-clear-"
                                                className="text-muted opacity-50"
                                            />
                                        )}
                                        {Object.entries(meta.schema!).map(([value, label]) => (
                                            <Select.Option
                                                key={value}
                                                value={value}
                                                label={label as unknown as string}
                                            />
                                        ))}
                                    </Select>
                                )}

                                {isJsonInput && isReady && (
                                    <TextArea
                                        key={jsonInputKey}
                                        hasError={formState.hasError(key)}
                                        defaultValue={JSON.stringify(currentValue, null, 2)}
                                        onChangeText={(value) => {
                                            try {
                                                const parsedValue = value ? JSON.parse(value) : undefined
                                                formState.setValue(key, parsedValue)
                                                formState.updateErrors({ [key]: [] })
                                            } catch (e) {
                                                formState.updateErrors({
                                                    [key]: ['Invalid JSON'],
                                                })
                                                return e
                                            }
                                        }}
                                    />
                                )}
                            </View>
                        </View>
                    )
                })}
            </View>
        </View>
    )
}

/* --- <ComponentDocs/> ------------------------------------------------------------------------ */

export const ComponentDocs = (props: ComponentDocsProps) => (
    <View className="relative min-w-400 mt-12">
        <ComponentDocsPreview {...props} />
        <View className="h-8" />
        <ComponentDocsPropTable {...props} />
    </View>
)
