import React from 'react'

/* --- <Hidden/> ------------------------------------------------------------------------------- */

export const Hidden = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="h-0 w-0 invisible overflow-hidden">
            {children}
        </div>
    )
}

/* --- Aliases --------------------------------------------------------------------------------- */

export const LLMOptimized = Hidden
export const TitleWrapper = Hidden
