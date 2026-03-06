"use client"
import { useState, useEffect } from 'react'
import { cn } from '@app/ui'
import { codeToHtml, BundledLanguage } from 'shiki'

/* --- Types ----------------------------------------------------------------------------------- */

export type CodeBlockProps = {
    code: string,
    lang?: BundledLanguage | HintedKeys,
    className?: string,
    children?: React.ReactNode,
}

/* --- <CodeBlock/> ---------------------------------------------------------------------------- */

export const CodeBlock = (props: CodeBlockProps) => {

    // Props
    const { code, lang = 'jsx', className, children } = props

    // State
    const [highlightedCode, setHighlightedCode] = useState<string | null>(null)

    // Vars
    const bgColor = highlightedCode?.split('style="background-color:')[1]?.split(';')[0] || ''

    // -- Effects --

    useEffect(() => {
        const highlightCode = async () => {
            const renderedCode = await codeToHtml(code, {
                lang,
                theme: 'dark-plus',
            })
            setHighlightedCode(renderedCode)
        }
        highlightCode()
    }, [code])

    // -- Render --

    return (
        <pre
            className={cn("relative overflow-x-auto rounded-xl p-4 ring-0", className)}
            style={{ backgroundColor: bgColor, margin: 0 }}
        >
            <code className="ml-[-16px] text-xs text-primary border-0">
                <span dangerouslySetInnerHTML={{ __html: highlightedCode || code }} />
            </code>
            {children}
        </pre>
    )
}
