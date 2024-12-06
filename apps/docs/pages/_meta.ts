import { meta as pluginsMeta } from './plugins/_meta'
import { isEmpty } from '@green-stack/utils/commonUtils'
import { featureMeta, packageMeta } from '@app/registries/workspaceImports.generated'

/* --- Helpers --------------------------------------------------------------------------------- */

const renderPluginItems = (options: any$Todo) => {
    return Object.entries(pluginsMeta).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: {
            title: value.title,
            route: value.route || `/plugins/${key}`,
            ...options,
    }}), {})
}

/* --- Top Level Sidebar ----------------------------------------------------------------------- */

export const meta = {

    '-- Universal Base Starter': {
        'type': 'separator',
        'title': 'Universal Base Starter',
    },

    'index': 'Introduction',

    // -- Plugins --

    // '-- Plugin Branches': {
    //     'type': 'separator',
    //     'title': 'Plugin Branches',
    // },

    // ...renderPluginItems({ display: false }),

    'plugins': {
        title: 'Plugin Branches',
        type: 'folder',
        items: renderPluginItems({ display: true }),
    },

    // -- FullProduct.dev ⚡️ --

    '-- FullProduct.dev ⚡️': {
        'type': 'separator',
        'title': '- FullProduct.dev ⚡️ Upgrade -',
    },

    'quickstart': 'Quickstart',
    'core-concepts': 'Core Concepts',
    'project-structure': 'Project Structure',
    'single-sources-of-truth': 'Single Sources of Truth',

    // -- Building your app --

    '-- Building universal apps': {
        'type': 'separator',
        'title': 'Building universal apps',
    },

    'universal-routing': 'Cross-Platform Routing',
    'write-once-styles': 'Styling Universal UI',
    'data-resolvers': 'Flexible Resolvers and API\'s',
    'data-fetching': 'Universal Data Fetching',
    'form-management': 'Form Management',

    // -- Guides --

    '-- Guides': {
        'type': 'separator',
        'title': 'Guides',
    },

    'app-config': 'Env Vars + App Config',

    // -- Portability --

    // '-- Portability': {
    //     'type': 'separator',
    //     'title': 'Portability',
    // },

    // 'maximum-code-reuse': 'Maximize Code Reuse',
    // 'workspace-drivers': 'Workspace Drivers',

    // -- Saving Time --

    // '-- Saving Time': {
    //     'type': 'separator',
    //     'title': 'Saving Time',
    // },

    // 'automations': 'Scripts and Automations',
    // 'generators': 'Code Generators',
    // 'git-based-plugins': 'Git based Plugins',

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
}

export default meta
