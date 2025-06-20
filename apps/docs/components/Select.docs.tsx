import type { ReactNode, ElementRef, Dispatch, SetStateAction, LegacyRef } from 'react'
import { createContext, useContext, useState, useEffect, forwardRef, useRef } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Platform, StyleSheet, Dimensions } from 'react-native'
import * as SP from '@green-stack/forms/Select.primitives'
import * as AppSelect from '@app/core/forms/Select.styled'
import { cn, styled, View, Text, Pressable, getThemeColor } from '@app/primitives'

/* --- Documentation overrides? ---------------------------------------------------------------- */

// -i- Optionally wrap and edit these to restyle the component for the docs

export const SelectContext = AppSelect.SelectContext
export const useSelectContext = AppSelect.useSelectContext

export const SelectTrigger = AppSelect.SelectTrigger
export const SelectTriggerProps = AppSelect.SelectTriggerProps

export const SelectScrollButton = AppSelect.SelectScrollButton
export const SelectScrollButtonProps = AppSelect.SelectScrollButtonProps

export const SelectContent = styled(AppSelect.SelectContent, 'bg-popover', { nativeID: 'docsTable' }) as typeof AppSelect.SelectContent
export const SelectContentProps = AppSelect.SelectContentProps

export const SelectLabel = AppSelect.SelectLabel
export const SelectLabelProps = AppSelect.SelectLabelProps

export const SelectItem = AppSelect.SelectItem
export const SelectItemProps = AppSelect.SelectItemProps

export const SelectSeparator = AppSelect.SelectSeparator
export const SelectSeparatorProps = AppSelect.SelectSeparatorProps

export const SelectProps = AppSelect.SelectProps

/* --- Constants ------------------------------------------------------------------------------- */

const isWeb = Platform.OS === 'web'
const isMobile = ['ios', 'android'].includes(Platform.OS)

/** --- createSelect() ------------------------------------------------------------------------- */
/** -i- Create a Universal Select where you can pass a Generic type to narrow the string `value` & `onChange()` params */
export const createSelectComponent = <T extends string = string>() => Object.assign(forwardRef<
    ElementRef<typeof SP.SelectRoot>,
    AppSelect.SelectProps<T>
>((rawProps, ref) => {
    // Props
    const props = SelectProps.applyDefaults(rawProps)
    const { placeholder, disabled, hasError, children, onChange, ...restProps } = props

    // State
    const [value, setValue] = useState<string>(props.value)
    const [options, setOptions] = useState(props.options)

    // Hooks
    const insets = useSafeAreaInsets()
    const contentInsets = {
        top: insets.top,
        bottom: insets.bottom,
        left: 12,
        right: 12,
    }

    // Vars
    const optionsKey = Object.keys(options).join('-')
    const hasPropOptions = Object.keys(props.options || {}).length > 0
    const selectValueKey = `${optionsKey}-${!!value}-${!!options?.[value]}`

    // -- Effects --

    useEffect(() => {
        const isValidOption = value && Object.keys(options || {})?.includes?.(value)
        if (isValidOption) {
            onChange(value as T)
        } else if (!value && !restProps.required) {
            onChange(undefined as unknown as T)
        }
    }, [value])

    useEffect(() => {
        if (props.value !== value) setValue(props.value)
    }, [props.value])

    // -- Render --

    return (
        <SelectContext.Provider value={{ value, setValue, options, setOptions }}>
            <SP.SelectRoot
                ref={ref}
                key={`select-${selectValueKey}`}
                {...restProps}
                value={{ value, label: options?.[value] }}
                className={cn('w-full relative', 'bg-transparent', props.className)}
                onValueChange={(option) => setValue(option!.value!)}
                disabled={disabled}
                asChild
            >
                <View>
                    <SelectTrigger
                        key={`select-trigger-${selectValueKey}`}
                        className={cn('w-full', 'bg-transparent', props.triggerClassName)}
                        disabled={disabled}
                        hasError={hasError}
                    >
                        <Text
                            key={`select-value-${optionsKey}-${!!value}-${!!options?.[value]}`}
                            className={cn(
                                'text-foreground text-sm',
                                'native:text-lg',
                                !value && !!placeholder && 'text-muted',
                                disabled && 'opacity-50',
                                props.valueClassName,
                            )}
                            disabled={disabled}
                        >
                            <SP.SelectValue
                                key={`select-value-${selectValueKey}`}
                                className={cn(
                                    'text-primary text-sm',
                                    'native:text-lg',
                                    !value && !!placeholder && 'text-muted',
                                    props.valueClassName,
                                )}
                                placeholder={placeholder}
                                asChild={isWeb}
                            >
                                {isWeb && (
                                    <Text className={cn(!value && !!placeholder && 'text-muted')}>
                                        {options?.[value] || placeholder}
                                    </Text>
                                )}
                            </SP.SelectValue>
                        </Text>
                    </SelectTrigger>
                    <SelectContent
                        insets={contentInsets}
                        className={cn(props.contentClassName)}
                    >
                        {hasPropOptions && (
                            <SP.SelectGroup asChild>
                                <View>
                                    {!!placeholder && <SelectLabel>{placeholder}</SelectLabel>}
                                    {Object.entries(props.options).map(([value, label]) => (
                                        <SelectItem key={value} value={value} label={label}>
                                            {label}
                                        </SelectItem>
                                    ))}
                                </View>
                            </SP.SelectGroup>
                        )}
                        {children}
                    </SelectContent>
                
                </View>
            </SP.SelectRoot>

        </SelectContext.Provider>
    )
}), {
    displayName: 'Select',
    Option: SelectItem,
    Item: SelectItem,
    Separator: SelectSeparator,
    Group: SP.SelectGroup,
    Label: SelectLabel,
    Content: SelectContent,
    /** -i- Create a Universal Select where you can pass a Generic type to narrow the string `value` & `onChange()` params */
    create: createSelectComponent,
})

/* --- Select ---------------------------------------------------------------------------------- */

export const Select = createSelectComponent()
