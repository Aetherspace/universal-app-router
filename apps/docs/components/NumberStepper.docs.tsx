import * as AppNumberStepper from '@app/core/forms/NumberStepper.styled'
import { styled } from '@app/primitives'

/* --- Documentation overrides? ---------------------------------------------------------------- */

// -i- Optionally wrap and edit these to restyle the component for the docs

export const NumberStepper = styled(AppNumberStepper.NumberStepper, '', {
    textInputClassName: 'bg-transparent',
})

export const NumberStepperProps = AppNumberStepper.NumberStepperProps
