import * as AppSelect from '@app/core/forms/Select.styled'
import { styled } from '@app/primitives'

/* --- Documentation overrides? ---------------------------------------------------------------- */

// -i- Optionally wrap and edit these to restyle the component for the docs

export const SelectContext = AppSelect.SelectContext
export const useSelectContext = AppSelect.useSelectContext

export const SelectTrigger = AppSelect.SelectTrigger
export const SelectTriggerProps = AppSelect.SelectTriggerProps

export const SelectScrollButton = AppSelect.SelectScrollButton
export const SelectScrollButtonProps = AppSelect.SelectScrollButtonProps

export const SelectContent = AppSelect.SelectContent
export const SelectContentProps = AppSelect.SelectContentProps

export const SelectLabel = AppSelect.SelectLabel
export const SelectLabelProps = AppSelect.SelectLabelProps

export const SelectItem = AppSelect.SelectItem
export const SelectItemProps = AppSelect.SelectItemProps

export const SelectSeparator = AppSelect.SelectSeparator
export const SelectSeparatorProps = AppSelect.SelectSeparatorProps

export const SelectProps = AppSelect.SelectProps
export const Select = Object.assign(styled(AppSelect.Select, 'bg-transparent', {
    triggerClassName: 'bg-transparent',
}), {
    displayName: 'Select',
    Option: SelectItem,
    Item: SelectItem,
    Separator: SelectSeparator,
    Group: AppSelect.Select.Group,
    Label: SelectLabel,
    Content: SelectContent,
})
