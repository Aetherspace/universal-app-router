import fs from 'fs'
import { parseWorkspaces, getAvailableSchemas, getAvailableDataBridges, swapImportAlias, globRel, hasOptOutPatterns, lowercaseFirstChar, createDivider, uppercaseFirstChar, maybeImport } from '@green-stack/scripts/helpers/scriptUtils'
import type { SchemaFileMeta, BridgeFileMeta } from '@green-stack/scripts/helpers/scriptUtils'
import { getSchemaMetadata, type Meta$Schema, type AnyZodSchema } from '@green-stack/schemas/compat'
import { renderSchemaToZodDefV3 } from '@green-stack/core/schemas'
import { renderSchemaToZodDefV4 } from '@green-stack/core/schemas/v4'
import { zodToTs, printNode } from 'zod-to-ts'
import { gen, createBridgedFormHookContent } from '@green-stack/core/generators/add-resolver'  
import { setProperty } from 'dot-prop'
import { DataBridgeType } from '@green-stack/schemas/createDataBridge'

/* --- Constants ------------------------------------------------------------------------------- */

const { workspacePaths, PATH_PKGS } = parseWorkspaces()
const availableSchemas = getAvailableSchemas()
const availableDataBridges = getAvailableDataBridges()

/* --- Types ----------------------------------------------------------------------------------- */

type ComponentDocsData = {
    rootPath: string,
    componentName: string,
    componentWorkspace: string,
    workspaceFolder: string,
    importPath: string,
    exampleImportPath: string,
    componentFileName: string,
    mdxFilePath: string,
    mdxFileFolder: string,
    documentationProps?: {
        componentName: string
        propSchema: AnyZodSchema
        propMeta: Record<string, Meta$Schema>
        previewProps: Record<string, any$Unknown>
    },
    propsSchemaDef?: string,
    propsTypeDef?: string,
    customMdxDocs?: string,
}

type ComponentDocsTree = {
    [componentName: string]: ComponentDocsData
}

type SchemaContext = Prettify<SchemaFileMeta & {
    schemaIntrospection: Meta$Schema
    schemaZodObjectDef: string
    schemaTypeDef: string
    customMdxDocs?: string,
}>

type ResolverContext = Prettify<typeof gen._parsed & BridgeFileMeta & {
    inputSchemaDef: string
    inputSchemaType: string
    outputSchemaDef: string
    outputSchemaType: string
    graphqlQueryDef: string
    resolverArgsName: string
    customMdxDocs?: string,
}>

type CustomDocsData = {
    entityName: string
    workspaceName: string
    workspaceFolder: string
    mdxFilePath: string
    mdxFileFolder: string
    mdxContent: string
}

type CustomDocsTree = {
    [mdxFilePath: string]: CustomDocsData
}

/** --- getSchemaVersion() --------------------------------------------------------------------- */
/** -i- Detect Zod v3 vs v4/mini for choosing the right schema renderer */
const getSchemaVersion = (schema: unknown): 'v3' | 'v4' => {
    if (schema != null && typeof schema === 'object' && '_zod' in schema) return 'v4'
    return 'v3'
}

/** --- renderSchemaToZodDef() ----------------------------------------------------------------- */
/** -i- Version-aware schema def renderer for docgen */
const renderSchemaToZodDef = (schema: unknown, schemaMeta: Meta$Schema): string => {
    return getSchemaVersion(schema) === 'v4'
        ? renderSchemaToZodDefV4(schemaMeta)
        : renderSchemaToZodDefV3(schemaMeta)
}

/** --- schemaToTypeDef() ---------------------------------------------------------------------- */
/** -i- Extract TS type from schema via zod-to-ts; fallback for v4/mini if zod-to-ts fails */
const schemaToTypeDef = (schema: unknown, name: string): string => {
    try {
        const { node } = zodToTs(schema as any, name)
        return printNode(node)
    } catch {
        return ''
    }
}

/** --- renderFileTree() ----------------------------------------------------------------------- */
/** -i- Renders the string representation of multiple paths as a Nextra FileTree */
const renderFileTree = (paths: string[]) => {
    // Build object representation of the file tree
    const fileTreeObj = paths.reduce((acc, path, i) => {
        const [fileName, ...reversedFolders] = path.split('/').reverse()
        const folders = reversedFolders.reverse()
        return setProperty(acc, `${folders.join('.')}.file-${i}`, fileName)
    }, {} as Record<string, any>)
    // Stringify the file tree and split into lines
    const fileTreeJSON = JSON.stringify(fileTreeObj, null, 4)
    const fileTreeLines = fileTreeJSON.split('\n').map((line) => {
        if (line === '{') return '<FileTree>'
        if (line === '}') return '</FileTree>'
        if (line.includes('": {')) {
            const [indent] = line.split('"')
            const folderName = line.split('"')[1]
            return `${indent}<FileTree.Folder name="${folderName}" defaultOpen>`
        }
        if (line.endsWith('}')) return line.replace('}', '</FileTree.Folder>')
        // Final line case for file names
        const [indent, _, __, fileName] = line.split('"')
        return `${indent}<FileTree.File name="${fileName}" />`
    })
    // Join the lines into a single string
    return fileTreeLines.join('\n')
}

/** --- createComponentDocsContent() ----------------------------------------------------------- */
/** -i- Creates the file contents for component / UI docs based on props schema and component metadata */
const createComponentDocsContent = (ctx: ComponentDocsData) => [
    
    `import { ${ctx.componentName}, getDocumentationProps } from '${ctx.importPath}'`,
    `import { ComponentDocs } from '@app/docs/components/ComponentDocs'`,
    `import { TitleWrapper } from '@app/docs/components/Hidden'`,
    `import { FileTree, Callout } from 'nextra/components'\n`,

    `<TitleWrapper>`,
    `    ## ${ctx.componentName}`,
    `</TitleWrapper>\n`,

    `# ${ctx.componentName}\n`,

    `\`\`\`typescript copy`,
    `import { ${ctx.componentName} } from '${ctx.exampleImportPath}'`,
    `\`\`\`\n`,

    `<TitleWrapper>`,
    `    ### Interactive Preview`,
    `</TitleWrapper>\n`,

    `<TitleWrapper>`,
    `    ### Code Example`,
    `</TitleWrapper>\n`,

    `<ComponentDocs`,
    `    component={${ctx.componentName}}`,
    `    docsConfig={getDocumentationProps}`,
    `>`,
    `    ## ${ctx.componentName} Props`,
    `</ComponentDocs>\n`,

    `<div className="h-8" />\n`,

    ...(ctx.propsSchemaDef ? [

        `<TitleWrapper>`,
        `    ### Props Schema`,
        `</TitleWrapper>\n`,

        `<details>`,
        `<summary>Show Props Schema</summary>\n`,

        `\`\`\`typescript copy`,
        `${ctx.propsSchemaDef}`,
        `\`\`\``,

        `> 💡 Could be handy to copy-paste into an AI chat?`,
        
        `</details>\n`,

        `<div className="h-8" />\n`,

    ] : []),

    ...(ctx.propsTypeDef ? [

        `<TitleWrapper>`,
        `### Props Type`,
        `</TitleWrapper>\n`,

        `<details>`,
        `<summary>Show Props Types</summary>\n`,

        `\`\`\`typescript copy`,
        `${ctx.propsTypeDef}`,
        `\`\`\``,

        `> 💡 Could be handy to copy-paste into an AI chat?`,
        
        `</details>\n`,

        `<div className="h-8" />\n`,

    ] : []),

    `<TitleWrapper>`,
    `## Source Code`,
    `</TitleWrapper>\n`,

    `### File Location\n`,

    `You can find the source of the \`${ctx.componentName}\` component in the following location:\n`,

    `${renderFileTree([ctx.rootPath])}\n`,

    `<div className="h-8" />\n`,

    ...(!!ctx.customMdxDocs ? [

        `## Developer Notes\n`,

        ctx.customMdxDocs,

        `<div className="h-8" />\n`,

    ] : []),

    `## Other\n`,

    `### Disclaimer - Automatic Docgen\n`,

    `<Callout emoji="🤖">`,
    [
        `These dynamic component docs were auto-generated with \`npm run regenerate:docs\`. `,
        `You can hook into automatic docgen by exporting \`getDocumentationProps\` from a component file. `,
        `You'll want to provide example props from the ComponentProps zod schema, e.g:`
    ].join(''),
    `</Callout>\n`,

    `\`\`\`tsx /getDocumentationProps/ /documentationProps/ copy filename="${ctx.rootPath.split('/').pop()}"`,
    `/* --- Docs ---------------------- */\n`,

    `export const getDocumentationProps = ${ctx.componentName}Props.documentationProps('${ctx.componentName}')`,
    `\`\`\`\n`,

].join('\n')

/** --- createSchemaDocs() --------------------------------------------------------------------- */
/** -i- creates the Schema MDX docs for a given schema and it's file metadata */
const createSchemaDocs = (ctx: SchemaContext) => [

    `import { FileTree, Callout } from 'nextra/components'`,
    `import { TitleWrapper } from '@app/docs/components/Hidden'`,
    `import { View, Image } from '@app/ui'\n`,

    `<TitleWrapper>`,
    `    ## ${ctx.schemaName}`,
    `</TitleWrapper>\n`,

    `# ${ctx.schemaName}\n`,

    `\`\`\`typescript copy`,
    `import { ${ctx.schemaName} } from '${ctx.workspaceName}/schemas/${ctx.schemaFileName}'`,
    `\`\`\`\n`,

    `### Location\n`,

    `${renderFileTree([ctx.schemaPath])}\n`,

    `### Zod Schema\n`,

    `What the schema would look like when defined with \`z.object()\` (${getSchemaVersion(ctx.schema) === 'v4' ? 'Zod V4 / Mini' : 'Zod V3'}):\n`,

    `\`\`\`typescript copy`,

    `${ctx.schemaZodObjectDef}`,

    `\`\`\`\n`,

    `> (💡 Could be handy to copy-paste this schema info into an AI chat assistant)`,

    `<div className="h-8" />\n`,
    
    `### Type Definition\n`,

    `You can extract the TypeScript type from the schema using \`z.input()\`, \`z.output()\` or \`z.infer()\` methods. e.g.:\n`,

    `\`\`\`typescript copy`,
    `type ${ctx.schemaName} = z.input<typeof ${ctx.schemaName}>`,
    `\`\`\`\n`,

    `What the resulting TypeScript type would look like:\n`,

    `\`\`\`typescript copy`,

    `${ctx.schemaTypeDef}`,

    `\`\`\`\n`,

    `> (💡 Could be handy to copy-paste this type info into an AI chat assistant)`,

    `<div className="h-8" />\n`,

    `### Usage - Validation\n`,

    `To validate data against this schema, you have a few options:\n`,

    `\`\`\`typescript copy`,

    `// Throws if invalid`,
    `const ${lowercaseFirstChar(ctx.schemaName)} = ${ctx.schemaName}.parse(data)\n`,

    `// Returns { success: boolean, data?: T, error?: ZodError }`,
    `const ${lowercaseFirstChar(ctx.schemaName)} = ${ctx.schemaName}.safeParse(data)\n`,

    `\`\`\`\n`,

    `> This might be useful for parsing API input data or validating form data before submission.\n`,

    `> You can also directly integrate this schema with form state managers like our own:\n`,

    `<div className="h-8" />\n`,
    
    `### Usage - Form State\n`,

    `\`\`\`typescript copy`,

    `import { useFormState } from '@green-stack/forms/useFormState'\n`,

    `const formState = useFormState(${ctx.schemaName}, {`,
    `    initialValues: { /* ... */ }, // Provide initial values?`,
    `    validateOnMount: true, // Validate on component mount?`,
    `})\n`,

    `\`\`\`\n`,

    `Learn more about using schemas for form state in our [Form Management Docs](/form-management).\n`,

    `<div className="h-8" />\n`,

    `### Usage - Component Props / Docs\n`,

    `Another potential use case for the '${ctx.schemaName}' schema is to type component props, provide default values and generate documentation for that component:\n`,

    `\`\`\`typescript copy`,

    `export const ${ctx.schemaName}ComponentProps = ${ctx.schemaName}.extend({`,
    `    // Add any additional props here`,
    `})\n`,

    `export type ${ctx.schemaName}ComponentProps = z.input<typeof ${ctx.schemaName}ComponentProps>\n`,

    `/* --- <${ctx.schemaName}Component/> --------------- */\n`,

    `export const ${ctx.schemaName}Component = (rawProps: ${ctx.schemaName}ComponentProps) => {\n`,

    `    // Extract the props and apply defaults + infer resulting type`,
    `    const props = ComponentProps.applyDefaults(rawProps)\n`,

    `    // ... rest of the component logic ...\n`,

    `}\n`,

    `/* --- Documentation --------------- */\n`,

    `export const documentationProps = ${ctx.schemaName}ComponentProps.documentationProps('${ctx.schemaName}Component')\n`,

    `\`\`\`\n`,

    `<div className="h-8" />\n`,

    ...(!!ctx.customMdxDocs ? [

        `## Developer Notes\n`,

        ctx.customMdxDocs,

        `<div className="h-8" />\n`,

    ] : []),

    `## Other\n`,
    
    `### Disclaimer - Automatic Docgen\n`,

    `<Callout emoji="🤖">`,
    [
        `These dynamic schema docs were auto-generated with \`npm run regenerate:docs\`. `,
        `This happens automatically for schema files in any \`\\schemas\\\` folder. `,
        `You can opt-out of this by adding \`// export const optOut = true\` somewhere in the file. `,
    ].join(''),
    `</Callout>\n`,

].filter(Boolean).join('\n')

/** --- createResolverDocs() ------------------------------------------------------------------- */
/** -i- creates the Resolver MDX docs for a given schema and it's file metadata */
const createResolverDocs = (ctx: ResolverContext) => [

    `import { FileTree, Callout } from 'nextra/components'`,
    `import { TitleWrapper } from '@app/docs/components/Hidden'`,
    `import { View, Image } from '@app/ui'\n`,

    `<TitleWrapper>`,
    `    ## \`${ctx.resolverName}\` - API`,
    `</TitleWrapper>\n`,

    `# ${ctx.resolverName}() - Resolver\n`,

    `${renderFileTree([
        `${ctx.workspacePath}/resolvers/${ctx.resolverFileName}.ts`,
        `${ctx.workspacePath}/resolvers/${ctx.fetcherFileName}.ts`,
        `${ctx.workspacePath}/resolvers/${ctx.resolverName}.bridge.ts`,
    ])}\n`,,

    `\`${ctx.resolverName}()\` is a ${ctx.resolverType} resolver that allows you to ${ctx.operationType} data from:\n`,

    `- [Async Functions](#server-usage) during other resolver logic / GraphQL / API calls server-side`,
    ctx.isGraphQl && `- [GraphQL](#graphql-${ctx.resolverType}) - As a GraphQL ${ctx.resolverType}`,
    ctx.hasApiRoute && `- [API route](#nextjs-api-route) (${ctx.routeMethods.join(' / ')})`,
    `- [Clientside Hooks](#client-usage) for calling the API with \`react-query\` from Web / Mobile\n`,

    `<div className="h-8" />\n`,

    // --- Config -----------------------------------------------------------------------

    `## Resolver Config\n`,

    `Input / output types, defaults, schemas and general config for the \`${ctx.resolverName}()\` resolver are defined in its DataBridge file. Importable from:\n`,

    `\`\`\`typescript copy`,
    `import { ${ctx.resolverName}Bridge } from '${ctx.workspaceName}/resolvers/${ctx.resolverName}.bridge'`,
    `\`\`\`\n`,

    `<div className="h-6" />\n`,

    // --- Input ------------------------------------------------------------------------

    `### Input Shape\n`,

    `You can find the schema used to validate the input arguments for the \`${ctx.resolverName}()\` resolver in the bridge config:\n`,

    `\`\`\`typescript copy`,
    `const ${ctx.inputSchemaName} = ${ctx.resolverName}Bridge.inputSchema`,
    `\`\`\`\n`,

    `<details${ctx.inputSchemaDef.length < 400 ? ' open' : ''}>`,
    `<summary>Show Input Schema</summary>\n`,

    `\`\`\`typescript copy`,
    `${ctx.inputSchemaDef}`,
    `\`\`\``,

    `> 💡 Could be handy to copy-paste into an AI chat?`,
    
    `</details>\n`,

    `<div className="h-4" />\n`,

    `If needed, you can extract the TypeScript type from the schema using \`z.input()\`, e.g.:\n`,

    `\`\`\`typescript copy`,
    `type ${ctx.inputSchemaName} = z.input<typeof ${ctx.inputSchemaName}>`,
    `\`\`\`\n\n`,

    `<details${ctx.inputSchemaType.length < 200 ? ' open' : ''}>`,
    `<summary>Show Input Type</summary>\n`,

    `\`\`\`typescript copy`,
    `${ctx.inputSchemaType}`,
    `\`\`\``,

    `> 💡 Could be handy to copy-paste into an AI chat?`,
    
    `</details>\n`,

    `<div className="h-8" />\n`,

    // --- Output -----------------------------------------------------------------------

    `### Output Shape\n`,

    `You can find the schema used to provide output defaults for the \`${ctx.resolverName}()\` resolver in the bridge config too:\n`,

    `\`\`\`typescript copy`,
    `const ${ctx.outputSchemaName} = ${ctx.resolverName}Bridge.outputSchema`,
    `\`\`\`\n`,

    `<details${ctx.outputSchemaDef.length < 400 ? ' open' : ''}>`,
    `<summary>Show Output Schema</summary>\n`,

    `\`\`\`typescript copy`,
    `${ctx.outputSchemaDef}`,
    `\`\`\``,

    `> 💡 Could be handy to copy-paste into an AI chat?`,
    
    `</details>\n`,

    `<div className="h-4" />\n`,

    `Here too, you can extract the TypeScript type from the schema using \`z.output()\`, e.g.:\n`,

    `\`\`\`typescript copy`,
    `type ${ctx.outputSchemaName} = z.output<typeof ${ctx.outputSchemaName}>`,
    `\`\`\`\n`,

    `<details${ctx.outputSchemaType.length < 200 ? ' open' : ''}>`,
    `<summary>Show Output Type</summary>\n`,

    `\`\`\`typescript copy`,
    `${ctx.outputSchemaType}`,
    `\`\`\``,

    `> 💡 Could be handy to copy-paste into an AI chat?`,
    
    `</details>\n`,

    `<div className="h-8" />\n`,

    // --- Async Function Usage ---------------------------------------------------------

    `## Server Usage\n`,

    `<div className="h-6" />\n`,

    `### \`${ctx.resolverName}()\` function\n`,
    
    `\`\`\`typescript copy`,
    `import { ${ctx.resolverName} } from '${ctx.workspaceName}/resolvers/${ctx.resolverFileName}'`,
    `\`\`\`\n`,

    `\`\`\`typescript copy`,
    `// ... Later, in resolver or script logic ...`,
    `const output = await ${ctx.resolverName}({ ...inputArgs })`,
    `//     ?^ ${ctx.outputSchemaName} `,
    `\`\`\`\n`,
    
    `Note that using resolvers like \`${ctx.resolverName}()\` as async functions is only available server-side, and might cause issues if imported into the client bundle. For client-side usage, use any of the other options below.\n`,

    `<div className="h-8" />\n`,

    // --- GraphQL Fetcher Usage --------------------------------------------------------

    ...(ctx.isGraphQl ? [
        
        `## GraphQL ${ctx.ResolverType}\n`,

        `<div className="h-6" />\n`,

        `### \`${ctx.fetcherName}()\`\n`,

        `\`\`\`typescript copy`,
        `import { ${ctx.fetcherName} } from '${ctx.workspaceName}/resolvers/${ctx.fetcherFileName}'`,
        `\`\`\`\n`,

        `\`${ctx.fetcherName}()\` is a universal GraphQL ${ctx.resolverType} fetcher function.  `,
        `It wil query the \`${ctx.resolverName}\` resolver for you as a GraphQL ${ctx.resolverType}:\n`,

        `\`\`\`typescript copy`,
        `const response = await ${ctx.fetcherName}({ ${ctx.resolverArgsName}: { ...inputArgs } })`,
        `//       ?^ { ${ctx.resolverName}: ${ctx.outputSchemaName} } `,
        `\`\`\`\n`,

        `Just make sure the \`${ctx.resolverArgsName}\` input matches the [\`${ctx.inputSchemaName}\`](#input-shape) schema.\n`,

        `If you prefer, you can also use the following GraphQL snippet in your own GraphQL fetching logic:\n`,

        `<div className="h-8" />\n`,

        `### GraphQL ${ctx.ResolverType} Snippet\n`,

        `\`\`\`graphql copy`,
        `${ctx.graphqlQueryDef}`,
        `\`\`\`\n`,

        `<div className="h-4" />\n`,
        
        `### Custom ${ctx.ResolverType}\n`,
        
        `Using a custom query, you can omit certain fields you don't need and request only what's necessary.\n`,

        `If you do, we suggest using \`graphqlQuery()\`, as it works seamlessly on the server, browser and mobile app:\n`,

        `\`\`\`typescript copy`,
        `import { graphql } from '@app/core/graphql/graphql'`,
        `import { graphqlQuery } from '@app/core/graphql/graphqlQuery'\n`,
        
        `const query = graphql(\``,
        `${ctx.graphqlQueryDef.split('\n').splice(0, 2).map(line => `    ${line}`).join('\n')}`,
        `            // -i- ... type hints for the fields you need ... -i-`,
        `        }`,
        `    }`,
        `\`)\n`,

        `const response = await graphqlQuery(query, { ${ctx.resolverArgsName}: { ...inputArgs } })`,
        `//       ?^ { ${ctx.resolverName}: ${ctx.outputSchemaName} } `,
        `\`\`\`\n`,

        `Just make sure the \`${ctx.resolverArgsName}\` input matches the [\`${ctx.inputSchemaName}\`](#input-shape) schema.\n`,

        `<div className="h-8" />\n`,

    ] : []),

    // --- React-Query Hook -------------------------------------------------------------

    ...(ctx.hasApiRoute ? [

        `## Next.js API Route\n`,

        `<div className="h-6" />\n`,

        ...ctx.routeMethods.map((method: string) => [

            `### \`${method}\` requests\n`,

            `\`\`\`shell copy`,
            `${method} ${ctx.apiPath}${method === 'GET' ? '?...' : ''}`,
            `\`\`\`\n`,

            ['GET'].includes(method) && `Provide query parameters as needed (e.g. \`?someArg=123\`).\n`,

            ['POST', 'PUT'].includes(method) && `Provide the request body as JSON (e.g. \`{ "someArg": 123 }\`).\n`,

            `Make sure the params / ${method === 'GET' ? 'query' : 'body'} input match the [\`${ctx.inputSchemaName}\`](#input-shape) schema.\n`,

            `<div className="h-4" />\n`,

        ]).flat(),

        `<div className="h-4" />\n`,

    ] : []),

    // --- React-Query Hook -------------------------------------------------------------

    `## Client Usage\n`,

    `<div className="h-6" />\n`,

    `### Custom \`react-query\` hook\n`,

    `> e.g. In the \`${ctx.fetcherFileName}.ts\` file:\n`,

    `\`\`\`typescript copy`,
    `import { ${ctx.useFetcherType}, ${ctx.UseFetcherTypeOptions}, ${ctx.ResolverType}Key } from '@tanstack/react-query'`,
    `\`\`\`\n`,

    `\`\`\`typescript copy\n`,
    ...(ctx.isQuery ? [
        `export const ${ctx.useFetcherHookName} = (`,
        `    input: ${ctx.FetcherInputTypeName},`,
        `    options?: Omit<${ctx.UseFetcherTypeOptions}<${ctx.FetcherOutputTypeName}>, '${ctx.resolverType}Fn' | '${ctx.resolverType}Key'> & {`,
        `        ${ctx.resolverType}Key?: ${ctx.ResolverType}Key,`,
        `    },`,
        `) => {`,
        `    return ${ctx.useFetcherType}({`,
        `        ${ctx.resolverType}Key: ['${ctx.fetcherName}', input],`,
        `        ${ctx.resolverType}Fn: (context) => ${ctx.fetcherName}(input),`,
        `        ...options,`,
        `    })`,
        `}`,
    ] : [
        `export const ${ctx.useFetcherHookName} = (`,
        `    options?: Omit<`,
        `        ${ctx.UseFetcherTypeOptions}<${ctx.FetcherOutputTypeName}, unknown, ${ctx.FetcherInputTypeName}>,`,
        `        '${ctx.resolverType}Fn' | '${ctx.resolverType}Key'`,
        `    > & { ${ctx.resolverType}Key?: ${ctx.ResolverType}Key }`,
        `) => {`,
        `    return ${ctx.useFetcherType}({`,
        `        ${ctx.resolverType}Key: ['${ctx.fetcherName}'],`,
        `        ${ctx.resolverType}Fn: (input: ${ctx.FetcherInputTypeName}) => ${ctx.fetcherName}(input),`,
        `        ...options,`,
        `    })`,
        `}`,
    ]),
    `\`\`\`\n`,

    `Be sure to check the [\`${ctx.useFetcherType}\`](https://tanstack.com/query/latest/docs/framework/react/reference/${ctx.useFetcherType}) docs for all the available options you might want to prefill or abstract.\n`,

    `<div className="h-6" />\n`,

    // --- React Hook Usage -------------------------------------------------------------

    `### Usage in React\n`,

    `\`\`\`typescript copy`,
    `import { ${ctx.useFetcherHookName} } from '${ctx.workspaceName}/resolvers/${ctx.fetcherFileName}'`,
    `\`\`\`\n`,

    ...(ctx.isQuery ? [
        `\`\`\`typescript copy`,
        `const { data, error, isLoading } = ${ctx.useFetcherHookName}({ ${ctx.resolverArgsName}: /* ... */ }, {`,
        `    // ... any additional options ...`,
        `})`,
        `\`\`\`\n`,
    ] : [
        `\`\`\`typescript copy`,
        `const { data, error, isLoading, mutateAsync } = ${ctx.useFetcherHookName}({`,
        `    // ... any additional options ...`,
        `})`,
        `\`\`\`\n`,

        `\`\`\`typescript copy`,
        `const onSubmit = async (input: ${ctx.inputSchemaName}) => {`,
        `    const response = await mutateAsync({ ${ctx.resolverArgsName}: input }, options)`,
        `    //      ?^ { ${ctx.resolverName}: ${ctx.outputSchemaName} } `,
        `}`,
        `\`\`\`\n`,
    ]),

    `Be sure to check the [\`${ctx.useFetcherType}\`](https://tanstack.com/query/latest/docs/framework/react/reference/${ctx.useFetcherType}) docs for all the available options.\n`,

    // --- React Form State -------------------------------------------------------------

    ...(ctx.isMutation ? [

        `<div className="h-6" />\n`,

        `### Usage - Form State\n`,

        `You can also use the \`${ctx.resolverName}\` input schema for react form state helpers, e.g.:\n`,

        renderFileTree([`${ctx.workspacePath}/hooks/${ctx.formHookName}.ts`]),

        `\`\`\`typescript copy`,
        createBridgedFormHookContent(ctx),
        `\`\`\`\n`,

        `Check out the [Form Management Docs](/form-management) for more details on how to use this hook.\n`,

    ] : []),

    `<div className="h-8" />\n`,

    // --- Custom MDX Docs -------------------------------------------------------------

    ...(!!ctx.customMdxDocs ? [

        `## Developer Notes\n`,

        ctx.customMdxDocs,

        `<div className="h-8" />\n`,

    ] : []),

    // --- Docgen Disclaimer ------------------------------------------------------------

    `## Other\n`,

    `### Disclaimer - Automatic Docgen\n`,

    `<Callout emoji="🤖">`,
    [
        `These dynamic API docs were auto-generated with \`npm run regenerate:docs\`. `,
        `This happens from \`.bridge.ts\` files in any \`\/resolvers\/\` folder.\n\n`,
        `You can opt-out of this by adding \`export const optOut = true\` somewhere in the file. `,
    ].join(''),
    `</Callout>\n`,

].filter(Boolean).join('\n')

/* --- regenerate-docs ------------------------------------------------------------------------- */

const regenerateDocs = async () => {
    try {

        // Keep track of metadata

        const workspaceMeta = {
            apps: {},
            features: {},
            packages: {},
            plugins: {},
        } as Record<string, Record<string, string>>

        const metaFilesTree = {} as Record<string, Record<string, string>>

        const addWorkspaceMeta = (
            workspacePath: string,
            forceWorkspaceType?: 'apps' | 'features '| 'packages' | 'plugins',
        ) => {
            const workspaceName = PATH_PKGS[workspacePath]
            let [workspaceType, workspaceFolder] = workspacePath.split('/')
            if (forceWorkspaceType) workspaceType = forceWorkspaceType
            if (workspaceMeta['plugins'][workspaceFolder]) workspaceType = 'plugins' // Override
            workspaceMeta[workspaceType][workspaceFolder] = workspaceName
        }

        // ----------------------------------------------------------------------------------------
        // -i- Keep track of which workspaces are plugins first
        // ----------------------------------------------------------------------------------------

        const appPluginPaths = globRel('../../apps/**/README.plugin.mdx')
        const featurePluginPaths = globRel('../../features/**/README.plugin.mdx')
        const packagePluginPaths = globRel('../../packages/**/README.plugin.mdx')
        const allPluginPaths = [...appPluginPaths, ...featurePluginPaths, ...packagePluginPaths]

        allPluginPaths.map((pluginPath) => {
            const filePath = pluginPath.replaceAll('../', '') // e.g. 'features/@app-core/README.plugin.mdx'
            const workspacePath = filePath.split('/').slice(0, 2).join('/') // e.g. 'features/@app-core'
            addWorkspaceMeta(workspacePath, 'plugins')
        })

        // ----------------------------------------------------------------------------------------
        // -i- Clear existing autogenerate package / feature docs
        // ----------------------------------------------------------------------------------------

        workspacePaths.map((workspacePath) => {
            const workspaceFolderName = workspacePath.split('/').pop()!
            const docsFolderName = `../../apps/docs/content/${workspaceFolderName}`
            fs.rmSync(docsFolderName, { recursive: true, force: true })
        })

        // ----------------------------------------------------------------------------------------
        // -i- Collect custom docs file paths
        // ----------------------------------------------------------------------------------------

        const featureMdxDocsPaths = globRel('../../features/**/*.docs.mdx')
        const packageMdxDocsPaths = globRel('../../packages/**/*.docs.mdx')
        const allMdxDocsPaths = [...featureMdxDocsPaths, ...packageMdxDocsPaths]

        const featureReadMePaths = globRel('../../features/**/README.md')
        const packageReadMePaths = globRel('../../packages/**/README.md')
        const allReadMePaths = [...featureReadMePaths, ...packageReadMePaths]
        const allCustomDocsPaths = [...allPluginPaths, ...allMdxDocsPaths, ...allReadMePaths]

        const customDocsTree = allCustomDocsPaths.reduce((acc, customDocsPath) => {

            // Skip empty files
            const mdxContent = fs.readFileSync(customDocsPath, 'utf-8')
            if (!mdxContent) return acc

            // Skip files that have opt-out patterns
            if (hasOptOutPatterns(mdxContent) && !customDocsPath.includes('@green-stack-core')) return acc

            // Figure out the paths and workspace info
            const filePath = customDocsPath.replaceAll('../', '') // e.g. 'features/@app-core/docs/Button.docs.mdx'
            const innerFilePath = filePath.split('/').slice(1).join('/') // e.g. '@app-core/docs/Button.docs.mdx'
            const fileNameWithExt = innerFilePath.split('/').pop()! // e.g. 'Button.docs.mdx'
            const fileName = fileNameWithExt.split('.').shift()! // e.g. 'Button'
            const workspacePath = filePath.split('/').slice(0, 2).join('/') // e.g. 'features/@app-core'
            const workspaceName = PATH_PKGS[workspacePath] // e.g. '@app/core'
            const workspaceFolder = workspacePath.split('/').pop()! // e.g. '@app-core'
            const innerFileFolder = innerFilePath.split('/').slice(0, -1).join('/') // e.g. '@app-core/docs'

            // Add relevant workspace meta for docs?
            addWorkspaceMeta(workspacePath)

            // Plan MDX file paths and _meta setup
            let mdxFileFolder = `../../apps/docs/content/${innerFileFolder}` // e.g. '../../apps/docs/content/@app-core/docs'
            let mdxFilePath = `${mdxFileFolder}/${fileName}.mdx` // e.g. '@app-core/docs/Button.mdx',
            const isIndexFile = mdxFilePath.includes('index.mdx')
            if (isIndexFile) mdxFilePath = mdxFilePath.replace('/index', '') // e.g. -> '@green-stack-core/schemas.mdx'
            if (isIndexFile) mdxFileFolder = mdxFileFolder.split('/').slice(0, -1).join('/') // e.g. -> '../../apps/docs/content/@green-stack-core'

            // Should the docs entry be named after the file or the folder?
            const entityName = isIndexFile ? mdxFilePath.split('/').pop()!.replace('.mdx', '') : fileName

            // Add to the custom docs tree
            return {
                ...acc,
                [mdxFilePath]: {
                    filePath,
                    entityName,
                    workspacePath,
                    workspaceFolder,
                    workspaceName,
                    mdxFilePath,
                    mdxFileFolder,
                    mdxContent,
                }
            }
        }, {} as CustomDocsTree)

        const extractCustomDocs = (mdxFilePath: string) => {
            // Skip if no custom docs found for this path
            const customDocs = customDocsTree[mdxFilePath]
            if (!customDocs) return ''
            // Extract the mdxContent
            const mdxContent = customDocs.mdxContent
            // Delete the entry so we don't process it again
            delete customDocsTree[mdxFilePath]
            // Return the mdxContent
            return mdxContent
        }

        // ----------------------------------------------------------------------------------------
        // -i- UI Component Docs
        // ----------------------------------------------------------------------------------------

        // Get all component file paths
        const featureComponentPaths = globRel('../../features/**/*.tsx')
        const packageComponentPaths = globRel('../../packages/**/*.tsx')
        const allComponentPaths = [...featureComponentPaths, ...packageComponentPaths]

        // Figure out import paths from each workspace
        const { workspaceImports } = parseWorkspaces('../../')

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

        // Build component docs tree
        const componentDocsTree = filteredComponentPaths.reduce((acc, componentPath) => {

            // Read the component file contents
            const fileContent = fs.readFileSync(componentPath, 'utf-8')

            // Skip files that have opt-out patterns
            if (hasOptOutPatterns(fileContent)) return acc

            // Filter out components not hooking into getDocumentationProps()
            if (!fileContent.includes('.documentationProps')) return acc
            if (!fileContent.includes('export const getDocumentationProps')) return acc
            if (fileContent.includes('// export const getDocumentationProps')) return acc

            // Figure out component workspace from filename
            const workspaceEntry = Object.entries(workspaceImports).find(([pathKey]) => {
                return componentPath.includes(pathKey)   
            })

            // Extract the component name & path info
            const [workspacePath, componentWorkspace] = workspaceEntry!
            const workspaceFolder = workspacePath.split('/').pop()! // e.g. '@app-core'
            const innerFilePath = componentPath.split(workspacePath)[1].replace('.tsx', '') // e.g. '/components/Button'
            const componentFileName = innerFilePath.split('/').pop()!
            const componentName = componentFileName.split('.').shift()!

            // Extract file and import paths
            const rootPath = componentPath.replaceAll('../', '') // e.g. '/features/@app-core/...'
            const importPath = swapImportAlias(`${componentWorkspace}${innerFilePath}`) // e.g. '@app-ui/components/Button'

            // Skip if not exported under the correct name
            if (!fileContent.includes(`export const ${componentName}`)) {
                console.warn(`Component '${componentName}' exports getDocumentationProps but the component itself is not a named export, skipping '${rootPath}' for automatic docgen.`)
                return acc
            }

            // Import the documentation props config
            const workspacePkg = PATH_PKGS[workspacePath]
            const importPathSync = importPath.replace(componentWorkspace, workspacePkg)
            const { getDocumentationProps } = maybeImport(importPathSync) as {
                getDocumentationProps: ComponentDocsData['documentationProps']
            }
            const isUIComponent = importPath.startsWith('@app/ui/components/') || importPath.startsWith('@app/ui/forms/')
            const exampleImportPath = isUIComponent ? '@app/ui' : importPathSync

            // Attempt to extract the zod schema definition and type definition
            const propsSchema = getDocumentationProps?.propSchema
            const propsSchemaDef = propsSchema ? renderSchemaToZodDef(propsSchema, propsSchema.introspect?.() as Meta$Schema) : ''
            const propsTypeDef = propsSchema ? schemaToTypeDef(propsSchema, componentName) : ''

            // Build MDX file path
            const mdxFileName = `${componentName}.mdx` // -> 'Button.mdx'
            const mdxInnerFilePath = innerFilePath.replace(componentFileName, mdxFileName)
            const mdxFilePath = `../../apps/docs/content/${workspaceFolder}${mdxInnerFilePath}` 
            const mdxFileFolder = mdxFilePath.split('/').slice(0, -1).join('/')
            const customMdxDocs = extractCustomDocs(mdxFilePath)

            // Add component docs to meta files tree
            metaFilesTree[mdxFileFolder] = {
                ...metaFilesTree[mdxFileFolder],
                [componentName]: componentName,
            }

            // Add relevant workspace meta for docs?
            addWorkspaceMeta(workspacePath)

            // Add to component tree
            return {
                ...acc,
                [componentName]: {
                    rootPath,
                    componentName,
                    componentWorkspace,
                    workspaceFolder,
                    importPath,
                    exampleImportPath,
                    componentFileName,
                    mdxFilePath,
                    mdxFileFolder,
                    propsSchemaDef,
                    propsTypeDef,
                    customMdxDocs,
                },
            }
        }, {} as ComponentDocsTree)

        // Write out component MDX docs files
        await Promise.all(Object.values(componentDocsTree).map(async (ctx: ComponentDocsData) => {
            const mdxContent = createComponentDocsContent({ ...ctx })
            fs.mkdirSync(ctx.mdxFileFolder, { recursive: true })
            fs.writeFileSync(ctx.mdxFilePath, mdxContent, { flag: 'w' })
            return Promise.resolve(true)
        }))

        // ----------------------------------------------------------------------------------------
        // -i- Data Schema Docs
        // ----------------------------------------------------------------------------------------

        await Promise.all(Object.values(availableSchemas).map(async (schemaMeta: SchemaFileMeta) => {

            // Figure out the metadata for the schema file
            const mdxFileName = `${schemaMeta.schemaName}.mdx` // -> 'Button.mdx'
            const mdxInnerFilePath = `/schemas/${mdxFileName}` // e.g. '/@app-core/schemas/Button.mdx'
            const mdxWorkspaceFolder = schemaMeta.workspacePath.split('/').pop()! // e.g. '@app-core'
            const mdxFilePath = `../../apps/docs/content/${mdxWorkspaceFolder}${mdxInnerFilePath}` 
            const mdxFileFolder = mdxFilePath.split('/').slice(0, -1).join('/')

            // Figure out custom MDX docs for this schema
            const customMdxDocs = extractCustomDocs(mdxFilePath)

            const schemaTypeDef = schemaToTypeDef(schemaMeta.schema, schemaMeta.schemaName)
            const schemaIntrospection = getSchemaMetadata(schemaMeta.schema) as Meta$Schema
            const schemaZodObjectDef = renderSchemaToZodDef(schemaMeta.schema, schemaIntrospection)
            const mdxContent = createSchemaDocs({
                ...schemaMeta,
                schemaIntrospection,
                schemaZodObjectDef,
                schemaTypeDef,
                customMdxDocs,
            })

            // Add relevant workspace meta for docs?
            addWorkspaceMeta(schemaMeta.workspacePath)
            
            // Add schema docs to meta files tree
            metaFilesTree[mdxFileFolder] = {
                ...metaFilesTree[mdxFileFolder],
                [schemaMeta.schemaName]: schemaMeta.schemaName,
            }

            // Save the schema MDX docs file
            if (!fs.existsSync(mdxFileFolder)) fs.mkdirSync(mdxFileFolder, { recursive: true })
            fs.writeFileSync(mdxFilePath, mdxContent, { flag: 'w' })

            // End the promise
            return Promise.resolve(true)
        }))

        // ----------------------------------------------------------------------------------------
        // -i- API Resolver Docs
        // ----------------------------------------------------------------------------------------

        await Promise.all(Object.values(availableDataBridges).map(async (bridgeMeta: BridgeFileMeta) => {
            
            const bridge = bridgeMeta.bridge as DataBridgeType
            const bridgeInputSchema = bridge.inputSchema
            const bridgeOutputSchema = bridge.outputSchema

            const inputSchemaType = schemaToTypeDef(bridge!.inputSchema!, bridgeMeta.inputSchemaName)
            const inputSchemaMeta = getSchemaMetadata(bridgeInputSchema) as Meta$Schema
            const inputSchemaDef = renderSchemaToZodDef(bridgeInputSchema, inputSchemaMeta)

            const outputSchemaType = schemaToTypeDef(bridge.outputSchema, bridgeMeta.outputSchemaName)
            const outputSchemaMeta = getSchemaMetadata(bridgeOutputSchema) as Meta$Schema
            const outputSchemaDef = renderSchemaToZodDef(bridge.outputSchema, outputSchemaMeta)

            const graphqlQueryDef = bridge?.getGraphqlQuery?.(true, false) || ''

            // Include parsed metadata from the resolver generator
            const parsedBridgeMeta = gen.parseAnswers({
                workspacePath: bridgeMeta.workspacePath,
                resolverName: bridgeMeta.resolverName,
                resolverType: bridgeMeta.resolverType,
                resolverDescription: '',
                inputSchemaTarget: bridgeMeta.inputSchemaName,
                inputSchemaName: bridgeMeta.inputSchemaName,
                outputSchemaTarget: bridgeMeta.outputSchemaName,
                outputSchemaName: bridgeMeta.outputSchemaName, // @ts-ignore
                apiPath: bridgeMeta.bridge?.apiPath || '',
                generatables: bridgeMeta.allowedMethods,
                formHookName: `use${uppercaseFirstChar(bridgeMeta.resolverName)}FormState`,
            })

            // Figure out the metadata for the resolver file
            const mdxFileName = `${bridgeMeta.resolverName}.mdx` // -> 'Button.mdx'
            const mdxInnerFilePath = `/resolvers/${mdxFileName}` // e.g. '/@app-core/resolvers/Button.mdx'
            const mdxWorkspaceFolder = bridgeMeta.workspacePath.split('/').pop()! // e.g. '@app-core'
            const mdxFilePath = `../../apps/docs/content/${mdxWorkspaceFolder}${mdxInnerFilePath}` 
            const mdxFileFolder = mdxFilePath.split('/').slice(0, -1).join('/')

            // Figure out custom MDX docs for this resolver
            const customMdxDocs = extractCustomDocs(mdxFilePath)

            // Build MDX content for the resolver
            const mdxContent = createResolverDocs({
                ...parsedBridgeMeta,
                ...bridgeMeta, // @ts-ignore
                resolverArgsName: bridgeMeta.bridge?.resolverArgsName,
                inputSchemaDef,
                inputSchemaType,
                outputSchemaDef,
                outputSchemaType, // @ts-ignore
                graphqlQueryDef,
                customMdxDocs,
            })

            // Add relevant workspace meta for docs?
            addWorkspaceMeta(bridgeMeta.workspacePath)

            // Add resolver docs to meta files tree
            metaFilesTree[mdxFileFolder] = {
                ...metaFilesTree[mdxFileFolder],
                [bridgeMeta.resolverName]: bridgeMeta.resolverName,
            }

            // Save the resolver MDX docs file
            if (!fs.existsSync(mdxFileFolder)) fs.mkdirSync(mdxFileFolder, { recursive: true })
            fs.writeFileSync(mdxFilePath, mdxContent, { flag: 'w' })

            // End the promise
            return Promise.resolve(true)
        }))

        // ----------------------------------------------------------------------------------------
        // -i- Save Remaining Custom Docs
        // ----------------------------------------------------------------------------------------

        await Promise.all(Object.values(customDocsTree).map(async (customDocs: CustomDocsData) => {
            // Extract the related metadata
            const { mdxFilePath, mdxFileFolder, mdxContent, entityName } = customDocs
            // Add resolver docs to meta files tree
            metaFilesTree[mdxFileFolder] = {
                ...metaFilesTree[mdxFileFolder],
                [entityName]: entityName,
            }
            // Save the custom MDX docs file
            if (!fs.existsSync(mdxFileFolder)) fs.mkdirSync(mdxFileFolder, { recursive: true })
            fs.writeFileSync(mdxFilePath, mdxContent, { flag: 'w' })
        }))

        // ----------------------------------------------------------------------------------------
        // -i- Meta Files & Wrap-Up
        // ----------------------------------------------------------------------------------------

        // Write out meta files
        await Promise.all(Object.entries(metaFilesTree).map(async ([folderPath, mdxDocNames]) => {
            const metaFileEntries = Object.keys(mdxDocNames).map((mdxDocName) => {
                return `    '${mdxDocName}': '${mdxDocName}',`
            })
            const metaFileContent = `\nexport default {\n${metaFileEntries.join('\n')}\n}\n`
            const metaFilePath = `${folderPath}/_meta.ts`
            if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true })
            fs.writeFileSync(metaFilePath, metaFileContent, { flag: 'w' })
            return Promise.resolve(true)
        }))

        // Write package aliases to registries
        const hasFeatureMeta = Object.keys(workspaceMeta.features).length > 0
        const hasPackageMeta = Object.keys(workspaceMeta.packages).length > 0
        const hasPluginMeta = Object.keys(workspaceMeta.plugins).length > 0
        const featureMeta = hasFeatureMeta ? JSON.stringify(workspaceMeta.features, null, 4) : '{}'
        const featureMetaLines = `export const featureMeta = ${featureMeta}`
        const packageMeta = hasPackageMeta ? JSON.stringify(workspaceMeta.packages, null, 4) : '{}'
        const packageMetaLines = `export const packageMeta = ${packageMeta}`
        const pluginMeta = hasPluginMeta ? JSON.stringify(workspaceMeta.plugins, null, 4) : '{}'
        const pluginMetaLines = `export const pluginMeta = ${pluginMeta}`
        const workspaceImportsFile = [featureMetaLines, packageMetaLines, pluginMetaLines].join('\n\n')
        fs.writeFileSync('../../packages/@registries/workspaceImports.generated.ts', workspaceImportsFile)

    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

regenerateDocs()
