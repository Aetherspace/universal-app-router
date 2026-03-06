import { notFound } from 'next/navigation'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { useMDXComponents as getMDXComponents } from '../../mdx-components'

/* --- Helpers --------------------------------------------------------------------------------- */

// -i- Skip static asset paths (e.g. /js/sf/script.js) that get caught by the catch-all
const isStaticAssetPath = (segments: string[]) => segments.length > 0 && (
    segments[0] === 'js' ||
    segments[0] === 'css' ||
    segments[0] === '_next' ||
    segments.some(s => s.includes('.'))
)

/* --- Static Params --------------------------------------------------------------------------- */

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: { params: Promise<{ mdxPath?: string[] }> }) {
    const params = await props.params
    const mdxPath = params.mdxPath ?? []
    if (isStaticAssetPath(mdxPath)) notFound()
    const { metadata } = await importPage(mdxPath)
    return metadata
}

/* --- Components ------------------------------------------------------------------------------ */

const Wrapper = getMDXComponents().wrapper

/* --- <Page/> --------------------------------------------------------------------------------- */

export default async function Page(props: { params: Promise<{ mdxPath?: string[] }> }) {

    // Params
    const params = await props.params
    const mdxPath = params.mdxPath ?? []

    // Guards
    if (isStaticAssetPath(mdxPath)) notFound()

    // Metadata
    const { default: MDXContent, toc, metadata, sourceCode } = await importPage(mdxPath)

    // -- Render --

    return (
        <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
            <MDXContent {...props} params={params} />
        </Wrapper>
    )
}
