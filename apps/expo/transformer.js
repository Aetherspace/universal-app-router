const upstreamTransformer = require('@expo/metro-config/babel-transformer')
const { createTransformer } = require('@bacons/mdx/metro-transformer')

/* --- MDX Transformer ------------------------------------------------------------------------- */

// -i- MDX v3 leaves whitespace-only text nodes (often with newlines) between block elements in the hast tree.
// -i- The DOM ignores them; React Native errors if a View ends up with raw string children.
// -i- Strip them before JSX/recma so compiled MDX has no bare "\n" strings under non-Text parents.

function rehypeStripNativeWhitespace() {
    function visit(node) {
        if (!node.children || node.tagName === 'pre') return
        node.children = node.children.filter(
            (child) =>
                !(
                    child.type === 'text' &&
                    child.value.trim() === '' &&
                    child.value.includes('\n')
                )
        )
        node.children.forEach(visit)
    }
    return visit
}

const mdxTransformer = createTransformer({
    rehypePlugins: [rehypeStripNativeWhitespace],
})

/* --- Exports --------------------------------------------------------------------------------- */

module.exports.transform = async (props) => {
    return upstreamTransformer.transform(
        await mdxTransformer.transform(props)
    )
}
