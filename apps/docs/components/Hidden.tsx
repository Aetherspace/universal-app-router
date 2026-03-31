import React from 'react'

/* --- Types ----------------------------------------------------------------------------------- */

type HiddenProps = {
    children: React.ReactNode,
    actuallyHidden?: boolean,
}

/* --- <Hidden/> ------------------------------------------------------------------------------- */

export const Hidden = ({ children, actuallyHidden }: HiddenProps) => {
    return (
        <div className="h-0 w-0 invisible overflow-hidden">
            {!actuallyHidden && children}
        </div>
    )
}

/* --- Aliases --------------------------------------------------------------------------------- */

export const LLMOptimized = Hidden
export const TitleWrapper = Hidden
