import { isEmpty } from '@green-stack/utils/commonUtils'
import { featureMeta, packageMeta, pluginMeta } from '@app/registries/workspaceImports.generated'

/* --- Top Level Sidebar ----------------------------------------------------------------------- */

export const meta = {

    'index': 'Quickstart',
    'core-concepts': 'Core Concepts',
    'project-structure': 'Project Structure',
    'single-sources-of-truth': 'Single Sources of Truth',

    // -- Building your app --

    '-- Building universal apps': {
        'type': 'separator',
        'title': 'Building universal apps',
    },

    'universal-routing': 'Cross-Platform Routing',
    'write-once-styles': 'Write-once Universal UI',
    'data-resolvers': 'Flexible Resolvers and API\'s',
    'data-fetching': 'Universal Data Fetching',
    'form-management': 'Form Management',

    // -- Guides --

    '-- Guides': {
        'type': 'separator',
        'title': 'Guides',
    },

    'app-config': 'Env Vars + App Config',
    'workspace-drivers': 'Workspace Drivers',
    'portability-patterns': 'Portability Patterns',

    // -- Portability --

    // '-- Portability': {
    //     'type': 'separator',
    //     'title': 'Portability',
    // },

    // 'maximum-code-reuse': 'Maximize Code Reuse',
    // 'workspace-drivers': 'Workspace Drivers',

    // -- Time Savers --

    '-- Time Savers': {
        'type': 'separator',
        'title': 'Time Savers',
    },

    // 'automations': 'Scripts and Automations',
    'generators': 'Code Generators',
    'automatic-docgen': 'Automatic Docgen',
    'git-based-plugins': 'Git Based Plugins',

    // -- UI Kit --

    '-- Design System': {
        'type': 'separator',
        'title': 'Design System',
    },

    '@app-ui': '@app/ui',

    // -- App Kit --

    '-- App Kit': {
        'type': 'separator',
        'title': 'FullProduct.dev APIs',
    },

    '@green-stack-core': '@green-stack/core',

    // -- Features --

    ...(!isEmpty(featureMeta) ? {
        '-- App Features': {
            'type': 'separator',
            'title': 'App Features',
        },
    } : {}),

    ...featureMeta,

    // -- Packages --

    ...(!isEmpty(packageMeta) ? {
        '-- Packages': {
            'type': 'separator',
            'title': 'Packages',
        },
    } : {}),

    ...packageMeta,

    // -- Plugins --

    ...(!isEmpty(pluginMeta) ? {
        '-- Installed Plugins': {
            'type': 'separator',
            'title': 'Installed Plugins',
        },
    } : {}),

    ...pluginMeta,

    // -- EndPadding --

    '-- EndPadding': {
        'type': 'separator',
        'title': ' ',
    },
}

export default meta
