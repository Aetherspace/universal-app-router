import glob from 'glob'
import fs from 'fs'
import { parseWorkspaces, swapImportAlias } from '@green-stack/scripts/helpers/scriptUtils'

/* --- Types ----------------------------------------------------------------------------------- */

type ComponentDocsData = {
    rootPath: string,
    componentName: string,
    componentWorkspace: string,
    workspaceFolder: string,
    importPath: string,
    componentFileName: string,
    mdxFilePath: string,
    mdxFileFolder: string,
    mdxContent: string,
}

type ComponentDocsTree = {
    [componentName: string]: ComponentDocsData
}

/* --- Templates ------------------------------------------------------------------------------- */

const renderFileTree = (rootPath: string) => {
    const [fileName, ...reversedFolders] = rootPath.split('/').reverse()
    const folders = reversedFolders.reverse()
    const folderLines = folders.map((folder) => `<FileTree.Folder name="${folder}" defaultOpen>`)
    return [
        '<FileTree>',
        ...folderLines.map((folder, i) => `${' '.repeat((1 + i) * 4)}${folder}`),
        `${' '.repeat((folders.length + 1) * 4)}<FileTree.File name="${fileName}" />`,
        ...folderLines.map((_, i) => `${' '.repeat((folders.length - i) * 4)}</FileTree.Folder>`),
        `</FileTree>`,
    ].join('\n')
}

const componentDocsTemplate = (v: ComponentDocsData) => `
import { ${v.componentName}, getDocumentationProps } from '${v.importPath}'
import { ComponentDocs } from '@app/core/mdx/ComponentDocs'
import { FileTree } from 'nextra/components'

# ${v.componentName}

\`\`\`tsx
import { ${v.componentName} } from '@app/components/${v.componentName}'
\`\`\`

<ComponentDocs
    component={${v.componentName}}
    docsConfig={getDocumentationProps}
/>

### Location

You can find the source of the \`${v.componentName}\` component in the following location:

${renderFileTree(v.rootPath)}
`

/* --- regenerate-docs ------------------------------------------------------------------------- */

const regenerateDocs = async () => {
    try {
        // Get all component file paths
        const featureComponentPaths = glob.sync('../../features/**/*.tsx')
        const packageComponentPaths = glob.sync('../../packages/**/*.tsx')
        const allComponentPaths = [...featureComponentPaths, ...packageComponentPaths]

        // Figure out import paths from each workspace
        const { workspaceImports } = parseWorkspaces()

        // Filter out irrelevant or non-component files
        const filteredComponentPaths = allComponentPaths.filter((componentPath) => {
            // Exclude barrel files
            if (componentPath.includes('/@registries/')) return false
            if (componentPath.includes('.primitives.tsx')) return false
            if (componentPath.includes('/index.tsx')) return false
            if (componentPath.includes('/styled.tsx')) return false
            // Exclude hooks
            if (componentPath.includes('/use')) return false
            // Exclude platform specific files
            if (componentPath.includes('.types.tsx')) return false
            if (componentPath.includes('.next.tsx')) return false
            if (componentPath.includes('.expo.tsx')) return false
            if (componentPath.includes('.web.tsx')) return false
            if (componentPath.includes('.native.tsx')) return false
            if (componentPath.includes('.ios.tsx')) return false
            if (componentPath.includes('.android.tsx')) return false
            // Check all other components for contents
            return true
        })

        // Keep track of metadata
        const workspaceMeta = { features: {}, packages: {} } as Record<string, Record<string, string>>

        // Build component docs tree
        const componentDocsTree = filteredComponentPaths.reduce((acc, componentPath) => {
            // Read the component file contents
            const fileContent = fs.readFileSync(componentPath, 'utf-8')
            // Filter out components not hooking into getDocumentationProps()
            if (!fileContent.includes('.documentationProps(')) return acc
            if (!fileContent.includes('export const getDocumentationProps')) return acc
            if (fileContent.includes('// export const getDocumentationProps')) return acc
            // Figure out component workspace from filename
            const workspaceEntry = Object.entries(workspaceImports).find(([pathKey]) => {
                return componentPath.includes(pathKey)   
            })
            // Extract the component name & path info
            const [workspacePath, componentWorkspace] = workspaceEntry!
            const workspaceFolder = workspacePath.split('/').pop()! // '@app-core'
            const innerFilePath = componentPath.split(workspacePath)[1].replace('.tsx', '') // '/components/Button'
            const componentFileName = innerFilePath.split('/').pop()!
            const componentName = componentFileName.split('.').shift()!
            // Extract file and import paths
            const rootPath = componentPath.replaceAll('../', '') // '/features/@app-core/...'
            const importPath = swapImportAlias(`${componentWorkspace}${innerFilePath}`) // '@app-core/components/Button'
            // Skip if not exported under the correct name
            if (!fileContent.includes(`export const ${componentName}`)) {
                console.warn(`Component '${componentName}' exports getDocumentationProps but the component itself is not a named export, skipping '${rootPath}' for automatic docgen.`)
                return acc
            }
            // Build MDX file path
            const mdxFileName = `${componentName}.mdx` // -> 'Button.mdx'
            const mdxInnerFilePath = innerFilePath.replace(componentFileName, mdxFileName)
            const mdxFilePath = `../../apps/docs/pages/${workspaceFolder}${mdxInnerFilePath}` 
            const mdxFileFolder = mdxFilePath.split('/').slice(0, -1).join('/')
            // Build MDX file
            const mdxContent = componentDocsTemplate({
                componentName,
                importPath,
                rootPath,
            } as ComponentDocsData)
            // Add relevant workspace meta for docs?
            const isFeatureComponent = workspacePath.includes('features')
            const isPackageComponent = workspacePath.includes('packages')
            if (isFeatureComponent) workspaceMeta.features[workspaceFolder] = componentWorkspace
            if (isPackageComponent) workspaceMeta.packages[workspaceFolder] = componentWorkspace
            // Add to component tree
            return {
                ...acc,
                [componentName]: {
                    rootPath,
                    componentName,
                    componentWorkspace,
                    workspaceFolder,
                    importPath,
                    componentFileName,
                    mdxFilePath,
                    mdxContent,
                    mdxFileFolder,
                },
            }
        }, {} as ComponentDocsTree)

        // Write out MDX files
        await Promise.all(Object.values(componentDocsTree).map(async (v: ComponentDocsData) => {
            fs.mkdirSync(v.mdxFileFolder, { recursive: true })
            fs.writeFileSync(v.mdxFilePath, v.mdxContent, { flag: 'w' })
            return Promise.resolve(true)
        }))

        // Write package aliases to registries
        const hasFeatureMeta = Object.keys(workspaceMeta.features).length > 0
        const hasPackageMeta = Object.keys(workspaceMeta.packages).length > 0
        const featureMeta = hasFeatureMeta ? JSON.stringify(workspaceMeta.features, null, 4) : '{}'
        const featureMetaLines = `export const featureMeta = ${featureMeta}`
        const packageMeta = hasPackageMeta ? JSON.stringify(workspaceMeta.packages, null, 4) : '{}'
        const packageMetaLines = `export const packageMeta = ${packageMeta}`
        const workspaceImportsFile = [featureMetaLines, packageMetaLines].join('\n\n')
        fs.writeFileSync('../../packages/@registries/workspaceImports.generated.ts', workspaceImportsFile)

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

regenerateDocs()
