'use client'
import React, { useState } from 'react'

/* --- Types ----------------------------------------------------------------------------------- */

type CodeBlockTabsProps = {
	items: string[]
	defaultIndex?: number
	children: React.ReactNode
}

type CodeBlockTabProps = {
	/** -i- Required for AI context. Must match CodeBlockTabs items (by position). */
	tabTitle?: string
	children: React.ReactNode
}

/* --- <CodeBlockTab/> ------------------------------------------------------------------------- */
/** -i- Wrapper for a tab's content. Use with CodeBlockTabs for tabbed code variants.
 ** -i- tabTitle must match the label in CodeBlockTabs items (by position) for AI context & validation. */
export const CodeBlockTab = ({ tabTitle, children }: CodeBlockTabProps) => <>{children}</>

/** --- <CodeBlockTabs/> ----------------------------------------------------------------------- */
/** -i- Code-block-specific tabs. Renders tabs + code as a single rounded unit.
 ** -i- Children should be CodeBlockTab panels, each containing Nextra fenced code (```ts etc).
 ** -i- Syntax highlighting stays with Nextra; we only provide the unified chrome. */
export const CodeBlockTabs = ({ items, defaultIndex = 0, children }: CodeBlockTabsProps) => {

    // State
	const [selectedIndex, setSelectedIndex] = useState(defaultIndex)

    // Vars
	const tabContents = React.Children.toArray(children)

	// Validate tabTitle matches items (by position)
	if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development') {
		tabContents.forEach((child, i) => {
            // @ts-ignore
			if (React.isValidElement(child) && 'tabTitle' in child.props) {
				const expected = items[i]
				const actual = (child.props as { tabTitle?: string }).tabTitle
				if (expected !== actual) {
					console.warn(
						`[CodeBlockTabs] tabTitle mismatch at index ${i}: expected "${expected}" (from items), got "${actual}"`,
					)
				}
			}
		})
	}

    // -- Render --

	return (
		<div className="code-block-tabs-root">
            <div className="code-block-tabs-bar">
                {items.map((label, index) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setSelectedIndex(index)}
                        className={`code-block-tabs-btn ${selectedIndex === index ? 'code-block-tabs-btn-active' : 'code-block-tabs-btn-inactive'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>
            <div className="code-block-tabs-content [&_pre]:!mt-0 [&_pre]:!rounded-t-none [&_pre]:!rounded-b-xl">
                {tabContents[selectedIndex]}
            </div>
		</div>
	)
}
