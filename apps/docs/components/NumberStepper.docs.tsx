import * as AppNumberStepper from '@app/ui'
import { styled } from '@app/ui'

/* --- Documentation overrides? ---------------------------------------------------------------- */

// -i- Optionally wrap and edit these to restyle the component for the docs

export const NumberStepper = styled(AppNumberStepper.NumberStepper, '', {
    textInputClassName: 'bg-transparent',
})

export const NumberStepperProps = AppNumberStepper.NumberStepperProps
