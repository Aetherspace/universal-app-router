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

    // -- Time Savers --

    '-- Time Savers': {
        'type': 'separator',
        'title': 'Time Savers',
    },

    // 'automations': 'Scripts and Automations',
    'generators': 'Code Generators',
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

    // -- Plugins --

    ...(!isEmpty(pluginMeta) ? {
        '-- Plugins': {
            'type': 'separator',
            'title': 'Plugins',
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
