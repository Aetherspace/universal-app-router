/* eslint-disable import/no-anonymous-default-export */
import { PlopTypes } from '@turbo/gen'
import { validateNonEmptyNoSpaces, getWorkspaceOptions, createDivider, a, normalizeName, getAvailableSchemas, dashToCamel, includesOption, uppercaseFirstChar, camelToDash, replaceMany, parseWorkspaces, extractPathParams } from '../scripts/helpers/scriptUtils'
import { createPrompts, toOptions, createOptionLookup } from '../scripts/helpers/createPrompts'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run add:resolver -- --args <workspacePath> <resolverName> <resolverDescription> <resolverType> ...
// -i- npx turbo gen resolver --args <workspacePath> <resolverName> <resolverDescription> <resolverType> ...

/* --- Constants ------------------------------------------------------------------------------- */

const { PATH_PKGS } = parseWorkspaces('./')
const workspaceOptions = getWorkspaceOptions('./')
const availableSchemas = getAvailableSchemas('./', { includeOptOut: true })

const GraphQlResolverOption = `GraphQL resolver` as const
const GetApiRouteOption = `GET api route` as const
const PostApiRouteOption = `POST api route` as const
const PutApiRouteOption = `PUT api route` as const
const DeleteApiRouteOption = `DELETE api route` as const
const CustomSchemaOption = `Custom Input & Output Schemas ${a.muted('(skips schema pickers)')}`
const FormHookOption = `Typed formState hook ${a.muted('(for resolver args)')}` as const

const QUERY_GENERATABLES = {
    [GraphQlResolverOption]: 'GRAPHQL',
    [GetApiRouteOption]: 'GET',
    [CustomSchemaOption]: 'schemas',
} as const
const MUTATION_GENERATABLES = {
    [GraphQlResolverOption]: 'GRAPHQL',
    [PostApiRouteOption]: 'POST',
    [PutApiRouteOption]: 'PUT',
    [DeleteApiRouteOption]: 'DELETE',
    [CustomSchemaOption]: 'schemas',
    [FormHookOption]: 'formHook',
} as const

const RESOLVER_GENERATABLES = { ...QUERY_GENERATABLES, ...MUTATION_GENERATABLES } as const

const GraphqlQueryOption = `Query <<< for retrieving data`
const GraphqlMutationOption = `Mutation >>> adding / updating / deleting data`
const RESOLVER_TARGETS = {
    [GraphqlQueryOption]: 'query',
    [GraphqlMutationOption]: 'mutation',
} as const

const NewInputSchemaOption = `New schema for resolver input ${a.bold(a.green('(+ New)'))}`
const NewOutputSchemaOption = `New schema for resolver output ${a.bold(a.green('(+ New)'))}`
const SCHEMA_SUGGESTIONS = createOptionLookup(Object.values(availableSchemas), 'schemaOption', 'schemaName')
const INPUT_SCHEMA_OPTIONS = [{ name: NewInputSchemaOption, value: 'new' }, ...SCHEMA_SUGGESTIONS]
const OUTPUT_SCHEMA_OPTIONS = [{ name: NewOutputSchemaOption, value: 'new' }, ...SCHEMA_SUGGESTIONS]

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts({

    workspacePath: {
        type: 'autocomplete',
        message: `Where would you like to add this resolver?`,
        choices: workspaceOptions,
    },
    resolverName: {
        type: 'input',
        message: `What is the resolver name? ${a.muted(`(e.g. "doSomething")`)}`,
    },
    resolverDescription: {
        type: 'input',
        message: `Optional description: What will this data resolver do? ${a.muted('(enter to skip)')}`,
    },
    resolverType: {
        type: 'list',
        message: 'Will this resolver query or mutate data?',
        choices: RESOLVER_TARGETS,
    },

    // -- Extras to generate? --

    generatables: {
        type: 'checkbox',
        message: 'What would you like to generate linked to this resolver?',
        choices: RESOLVER_GENERATABLES,
    },

    // -- Custom Schemas? --

    inputSchemaTarget: {
        type: 'autocomplete',
        message: 'Which schema should we use for the resolver inputs?',
        choices: INPUT_SCHEMA_OPTIONS,
    },
    inputSchemaName: {
        type: 'input',
        message: 'What will you call this new input schema?',        
    },
    outputSchemaTarget: {
        type: 'autocomplete',
        message: 'Which schema should we use for the resolver output?',
        choices: OUTPUT_SCHEMA_OPTIONS,
    },
    outputSchemaName: {
        type: 'input',
        message: 'What will you call this new output schema?',
    },

    // -- API routes? --

    apiPath: {
        type: 'input',
        message: `What API path would you like to use for REST? ${a.muted('(e.g. "/api/some/resolver/[slug]")')}`,
    },

    // -- Form Hook? --

    formHookName: {
        type: 'input',
        message: 'What should the form hook be called?',
    },

}, {

    compute: {

        resolverName: {
            validate: validateNonEmptyNoSpaces,
        },
        resolverType: {
            default: ({ resolverName, resolverDescription }) => {
                const mutationTriggerWords = ['update', 'edit', 'delete', 'remove', 'add', 'create']
                const checkingString = `${resolverName} ${resolverDescription}`.toLowerCase()
                const isMutatable = mutationTriggerWords.some((word) => checkingString.includes(word))
                return isMutatable ? 'mutation' : 'query'
            }
        },

        // -- Extras to generate? --

        generatables: {
            choices: ({ resolverType }) => {
                if (resolverType === 'query') return toOptions(QUERY_GENERATABLES)
                return toOptions(MUTATION_GENERATABLES)
            },
            default: ({ resolverType }) => {
                if (resolverType === 'query') return ['GRAPHQL', 'GET']
                return ['GRAPHQL', 'POST', 'formHook']
            }
        },

        // -- Custom Schemas? --

        inputSchemaTarget: {
            when: ({ generatables }) => !generatables?.includes('schemas'),
        },
        inputSchemaName: {
            default: ({ resolverName }) => `${uppercaseFirstChar(normalizeName(resolverName))}Input`,
            validate: validateNonEmptyNoSpaces,
            when: ({ inputSchemaTarget, generatables }) => {
                if (inputSchemaTarget === 'new') return true
                return !!generatables?.includes('schemas')
            }
        },
        outputSchemaTarget: {
            default: ({ inputSchemaTarget }) => inputSchemaTarget, // Re-use the input schema?
            when: ({ generatables }) => !generatables?.includes('schemas'),
        },
        outputSchemaName: {
            default: ({ resolverName }) => `${uppercaseFirstChar(normalizeName(resolverName))}Output`,
            validate: validateNonEmptyNoSpaces,
            when: ({ outputSchemaTarget, generatables }) => {
                if (outputSchemaTarget === 'new') return true
                return !!generatables?.includes('schemas')
            }
        },

        // -- API routes? --

        apiPath: {
            default: ({ resolverName, workspacePath }) => {
                const workspacePkg = PATH_PKGS[workspacePath]
                let workspaceName = workspacePkg?.split('/')[1].replace('-core', '').replace('-page', '') // prettier-ignore
                if (workspaceName.includes('@')) workspaceName = workspaceName.replace('@', '')
                return `/api/${workspaceName}/${camelToDash(resolverName)}` // prettier-ignore
            },
            validate: (input) => {
                if (!input.startsWith('/api/')) return 'API paths must start with "/api/"'
                if (!input.includes('/')) return 'API paths must include at least one "/"'
                if (input.includes(' ')) return 'API paths cannot include spaces, use dashes "-" instead'
                if (input.includes('//')) return 'API paths cannot include double slashes "//"'
                if (input.includes('.')) return 'API paths cannot include periods "." or file extensions'
                return validateNonEmptyNoSpaces(input)
            },
            when: ({ generatables }) => {
                return ['GET', 'POST', 'PUT', 'DELETE'].some(includesOption(generatables))
            }
        },

        // -- Form Hook? --

        formHookName: {
            default: ({ resolverName }) => {
                const formHookName = `use${uppercaseFirstChar(normalizeName(resolverName))}Form`
                return replaceMany(formHookName, ['Add', 'Create', 'Edit', 'Update', 'Delete', 'Resolver'], '') // prettier-ignore
            },
            when: ({ generatables }) => generatables.includes('formHook'),
            validate: validateNonEmptyNoSpaces,
        },

    },

    parser: (answers) => {

        // Args
        const workspacePkg = PATH_PKGS[answers.workspacePath]
        const resolverName = normalizeName(dashToCamel(answers.resolverName))
        const resolvername = resolverName.toLowerCase()
        const inputSchemaConfig = availableSchemas[answers.inputSchemaTarget]
        const outputSchemaConfig = availableSchemas[answers.outputSchemaTarget]
        const inputSchemaName = inputSchemaConfig?.schemaName || answers.inputSchemaName
        const outputSchemaName = outputSchemaConfig?.schemaName || answers.outputSchemaName

        // Flags
        const isQuery = answers.resolverType === 'query'
        const isMutation = answers.resolverType === 'mutation'
        const shouldCreateQueryFile = answers.generatables?.includes('GRAPHQL') && isQuery
        const shouldCreateMutationFile = answers.generatables?.includes('GRAPHQL') && isMutation
        const isExistingInputSchema = !!inputSchemaConfig
        const isExistingOutputSchema = !!outputSchemaConfig

        // Naming
        const ResolverName = uppercaseFirstChar(resolverName)
        const ResolverBridgeName = `${resolverName}Bridge`
        const resolverBrigeFileName = `${resolverName}.bridge`
        const resolverFileName = `${resolverName}.resolver`
        const formHookFileName = answers.formHookName || `use${ResolverName}`
        const fetcherFileName = `${resolverName}.${answers.resolverType}`
        const ResolverType = uppercaseFirstChar(answers.resolverType)
        const fetcherName = `${resolverName}${ResolverType}`
        const FetcherInputTypeName = `${ResolverName}${ResolverType}Input`
        const FetcherOutputTypeName = `${ResolverName}${ResolverType}Output`
        const useFetcherHookName = `use${ResolverName}${ResolverType}`
        const useFetcherType = `use${ResolverType}`
        const UseFetcherTypeOptions = `Use${ResolverType}Options`

        // Pre-fill some schema inputs from path params?
        const apiParams = extractPathParams(answers.apiPath)
        const inputSchemaParamLines = apiParams.map((param) => `${param}: z.string(),`)

        // Allowed methods
        const allowedMethods = answers.generatables?.filter((option) => {
            if (option === 'schemas') return false
            if (option === 'formHook') return false
            return Object.values(RESOLVER_GENERATABLES).includes(option)
        })
        const routeMethods = allowedMethods.filter((option) => option !== 'GRAPHQL')
        const hasApiRoute = routeMethods.length > 0
        const isGraphQl = allowedMethods?.includes('GRAPHQL')
        const isGraphQlOnly = isGraphQl && allowedMethods.length === 1

        // Schema Imports
        const schemaImportLines = []
        const createImportLine = (c: typeof inputSchemaConfig) => {
            return `import { ${c.schemaName} } from '${c.workspaceName}/schemas/${c.schemaName}'`
        }
        if (isExistingInputSchema) schemaImportLines.push(createImportLine(inputSchemaConfig))
        if (isExistingOutputSchema) schemaImportLines.push(createImportLine(outputSchemaConfig))

        // -- Return --

        return {
            ...answers,
            workspacePkg,
            resolverName,
            resolvername,
            allowedMethods,
            routeMethods,
            inputSchemaConfig,
            outputSchemaConfig,
            inputSchemaName: inputSchemaName ? normalizeName(inputSchemaName) : undefined,
            outputSchemaName: outputSchemaName ? normalizeName(outputSchemaName) : undefined,
            isQuery,
            isMutation,
            isGraphQl,
            isGraphQlOnly,
            hasApiRoute,
            shouldCreateQueryFile,
            shouldCreateMutationFile,
            isExistingInputSchema,
            isExistingOutputSchema,
            resolverBrigeFileName,
            resolverFileName,
            fetcherFileName,
            formHookFileName,
            ResolverName,
            ResolverBridgeName,
            ResolverType,
            resolverBridgePkg: '..',
            fetcherName,
            FetcherInputTypeName,
            FetcherOutputTypeName,
            useFetcherHookName,
            useFetcherType,
            UseFetcherTypeOptions,
            apiParams,
            inputSchemaParamLines,
            schemaImportLines,
        }

    }

})

/* --- Types ----------------------------------------------------------------------------------- */

type Answers = typeof gen._values
type Context = typeof gen._parsed

/** --- createBridgeContent() ------------------------------------------------------------------ */
/** -i- Creates the file content for a resolver's databridge file */
export const createBridgeContent = (ctx: Context) => [

    `import { z, schema } from '@green-stack/schemas'`,
    `import { createDataBridge } from '@green-stack/schemas/createDataBridge'${!ctx.schemaImportLines.length ? '\n' : ''}`,
    ...ctx.schemaImportLines.map((line, i) => `${line}${i === ctx.schemaImportLines.length - 1 ? '\n' : ''}`),

    ...!ctx.isExistingInputSchema ? [

        `${createDivider('Input')}\n`,

        `export const ${ctx.inputSchemaName} = schema('${ctx.inputSchemaName}', {`,
            ...ctx.inputSchemaParamLines.map((line) => `    ${line}`),
            !ctx.inputSchemaParamLines.length ? `    // TODO: Add your input schema fields here, e.g.` : '',
            !ctx.inputSchemaParamLines.length ? `    verbose: z.boolean().default(false),` : '',
        `})\n`,

        `export type ${ctx.inputSchemaName} = z.input<typeof ${ctx.inputSchemaName}>\n`,

    ] : [],

    ...!ctx.isExistingOutputSchema ? [

        `${createDivider('Output')}\n`,

        `export const ${ctx.outputSchemaName} = schema('${ctx.outputSchemaName}', {`,
        `    // TODO: Add your output schema fields here, e.g.`,
        `    success: z.boolean().default(false),`,
        `    args: ${ctx.inputSchemaName}.optional(),`,
        `})\n`,

        `export type ${ctx.outputSchemaName} = z.output<typeof ${ctx.outputSchemaName}>\n`,

    ] : [],

    `${createDivider('Bridge', true)}`,
    `/** -i- ${ctx.resolverDescription || `Data Bridge for the ${ctx.resolverName} resolver`} */`,
    `export const ${ctx.ResolverBridgeName} = createDataBridge({`,
    `    resolverName: '${ctx.resolverName}',`,
    `    inputSchema: ${ctx.inputSchemaName},`,
    `    outputSchema: ${ctx.outputSchemaName},`,
    `    apiPath: '${ctx.apiPath}',`,
    `    allowedMethods: [${ctx.allowedMethods.map(mthd => `'${mthd}'`).join(', ')}],`,
    `})\n`,

].filter(Boolean).join('\n')

/** --- createResolverContent() ---------------------------------------------------------------- */
/** -i- Creates the file contents for the resolver business logic file */
export const createResolverContent = (ctx: Context) => [

    `import { createResolver } from '@green-stack/schemas/createResolver'`,
    `import { ${ctx.ResolverBridgeName} } from './${ctx.resolverBrigeFileName}'\n`,

    `${createDivider('Usage')}\n`,

    ...ctx.routeMethods.map((method, i) => `// ${method} http://localhost:3000${ctx.apiPath}${i === ctx.routeMethods.length - 1 ? '\n' : ''}`),

    `// -i- Server-side function:`,
    `// ${ctx.resolverName}({ ...inputArgs })\n`,

    `// -i- Client-side hook:`,
    `// ${ctx.useFetcherHookName}({ ${ctx.resolverName}Args: { ...inputArgs } })\n`,

    `// -i- Universal fetcher:`,
    `// ${ctx.fetcherName}({ ${ctx.resolverName}Args: { ...inputArgs } })\n`,

    `${createDivider(`${ctx.resolverName}()`, true)}`,
    `/** -i- ${ctx.resolverDescription || `Executes the ${ctx.resolverName} resolver business logic`} */`,
    `export const ${ctx.resolverName} = createResolver(async ({ req, args, parseArgs, withDefaults, context, Data }) => {\n`,

    `    // -- Args --\n`,

    `    const a = parseArgs(args)\n`,

    `    // -- Auth checks? --\n`,

    `    // TODO: Check if the user is authenticated and is allowed to use this resolver?\n`,

    `    // -- Build Response Context? --\n`,

    `    const d = ${ctx.isExistingOutputSchema ? '{}' : '{ args: a, }'} as typeof Data\n`,

    `    // -- Business Logic --\n`,

    `    // TODO: Add your business logic here to populate the response or return early\n`,

    `    // -- Output --\n`,

    `    return withDefaults(d)\n`,

    `}, ${ctx.ResolverBridgeName})\n`,

].filter(Boolean).join('\n')

/** --- createFetcherContent() ----------------------------------------------------------------- */
/** -i- Creates the file contents for the resolver fetcher file */
export const createFetcherContent = (ctx: Context) => [

    `import { bridgedFetcher } from '@green-stack/schemas/bridgedFetcher'`,
    `import { ${ctx.useFetcherType}, ${ctx.UseFetcherTypeOptions}, ${ctx.ResolverType}Key } from '@tanstack/react-query'`,
    `import { ${ctx.ResolverBridgeName} } from './${ctx.resolverBrigeFileName}'\n`,

    `${createDivider(`${ctx.fetcherName}()`, true)}`,
    `/** -i- ${ctx.resolverDescription || `Calls the ${ctx.resolverName} API`} (fetcher fn) */`,
    `export const ${ctx.fetcherName} = bridgedFetcher(${ctx.ResolverBridgeName})\n`,

    `${createDivider('Types')}\n`,

    `export type ${ctx.FetcherInputTypeName} = Parameters<typeof ${ctx.fetcherName}>[0]\n`,

    `export type ${ctx.FetcherOutputTypeName} = Unpromisify<ReturnType<typeof ${ctx.fetcherName}>>\n`,

    `${createDivider(`${ctx.useFetcherHookName}()`, true)}`,
    `/** -i- ${ctx.resolverDescription || `Calls the ${ctx.resolverName} API`} (react-query) */`,
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

].filter(Boolean).join('\n')

/** --- createResolverApiRouteContent() -------------------------------------------------------- */
/** -i- Creates the file contents for a resolver's API route file */
export const createResolverApiRouteContent = (ctx: Context) => [

    ctx.isGraphQl && `import { createGraphResolver } from '@green-stack/core/schemas/createGraphResolver'`,
    ctx.hasApiRoute && `import { createNextRouteHandler } from '@green-stack/core/schemas/createNextRouteHandler'`,
    `import { ${ctx.resolverName} } from '${ctx.workspacePkg}/resolvers/${ctx.resolverFileName}'\n`,

    ...ctx.hasApiRoute ? [
        
        `${createDivider('Routes')}\n`,

        ...ctx.routeMethods.map((method) => `export const ${method} = createNextRouteHandler(${ctx.resolverName})\n`),

    ] : [],

    ...ctx.isGraphQl ? [

        `${createDivider('GraphQL')}\n`,
        
        `// -i- Picked up by \`npm run collect:resolvers\` when running dev to add to list of resolvers`,
        `// -i- which \`npm run build:schema\` will later turn into new GraphQL schema definitions`,
        `export const graphResolver = createGraphResolver(${ctx.resolverName})\n`,

    ] : [],

].filter(Boolean).join('\n')

/** --- createBridgedFormHookContent() --------------------------------------------------------- */
/** -i- Creates the file contents for the formHook related to the generated resolver input */
export const createBridgedFormHookContent = (ctx: Pick<Context, 'ResolverBridgeName' | 'resolverBrigeFileName' |'ResolverName' | 'resolverName' | 'formHookName' | 'resolverBridgePkg'>) => [

    `import { z } from '@green-stack/schemas'`,
    `import { useFormState } from '@green-stack/forms/useFormState'`,
    `import { ${ctx.ResolverBridgeName} } from '${ctx.resolverBridgePkg}/resolvers/${ctx.resolverBrigeFileName}'\n`,

    `${createDivider('Types')}\n`,

    `const { inputSchema: ${ctx.ResolverName}Input } = ${ctx.ResolverBridgeName}\n`,

    `export const ${ctx.ResolverName}FormData = ${ctx.ResolverName}Input.extendSchema('${ctx.ResolverName}FormData', {})\n`,

    `export type ${ctx.ResolverName}FormData = z.input<typeof ${ctx.ResolverName}FormData>\n`,

    `${createDivider(`${ctx.formHookName}()`, true)}`,
    `/** -i- Form hook for the ${ctx.resolverName}() resolver input */`,
    `export const ${ctx.formHookName} = (options: {`,
    `    initialValues?: Partial<${ctx.ResolverName}FormData>,`,
    `    validateOnChange?: boolean,`,
    `    validateOnBlur?: boolean,`,
    `    syncFromPropsKey?: string,`,
    `} = {}) => {`,
    `    return useFormState(${ctx.ResolverName}FormData, options)`,
    `}\n`,

].filter(Boolean).join('\n')

/** --- Resolver Generator --------------------------------------------------------------------- */
/** -i- Add a new resolver */
export const registerResolverGenerator = (plop: PlopTypes.NodePlopAPI) => {
    plop.setGenerator('resolver', {
        description: 'Add a new resolver',
        prompts: gen.prompts,
        actions: (data: GenAnswers) => {

            const ctx = gen.parseAnswers(data)

            // -- Templates --

            const resolverBridgeContent = createBridgeContent(ctx)

            const resolverContent = createResolverContent(ctx)

            const resolverFetcherContent = createFetcherContent(ctx)

            const resolverApiRouteContent = createResolverApiRouteContent(ctx)

            const formHookContent = createBridgedFormHookContent(ctx)

            // -- Actions --

            const actions = [
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/resolvers/${ctx.resolverBrigeFileName}.ts`,
                    template: resolverBridgeContent,
                },
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/resolvers/${ctx.resolverFileName}.ts`,
                    template: resolverContent,
                },
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/resolvers/${ctx.fetcherFileName}.ts`,
                    template: resolverFetcherContent,
                },
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/routes/${ctx.apiPath}/route.ts`,
                    template: resolverApiRouteContent,
                },
                ...(ctx.generatables?.includes('formHook') ? [{
                    type: 'add',
                    path: `${ctx.workspacePath}/hooks/${ctx.formHookFileName}.ts`,
                    template: formHookContent,
                }] : []),
                {
                    type: 'collect-resolvers',
                },
                {
                    type: 'link-routes',
                },
                {
                    type: 'build-schema',
                },
                {
                    type: 'open-files-in-vscode',
                    paths: [
                        `${ctx.workspacePath}/resolvers/${ctx.resolverBrigeFileName}.ts`,
                        `${ctx.workspacePath}/resolvers/${ctx.resolverFileName}.ts`,
                        `${ctx.workspacePath}/resolvers/${ctx.fetcherFileName}.ts`,
                        ctx.generatables?.includes('formHook') && `${ctx.workspacePath}/hooks/${ctx.formHookFileName}.ts`,
                    ].filter(Boolean),
                },
            ] as PlopTypes.ActionType[]

            // -- Generate --

            return actions.filter(Boolean)
        },
    })
}
