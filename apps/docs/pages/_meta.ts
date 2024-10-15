import { meta as pluginsMeta } from './plugins/_meta'

const renderPluginItems = (options: any$Todo) => {
    return Object.entries(pluginsMeta).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: {
            title: value.title,
            route: value.route || `/plugins/${key}`,
            ...options,
    }}), {})
}

export const meta = {
    '-- Universal Base Starter': {
        'type': 'separator',
        'title': 'Universal Base Starter',
    },
    'index': 'Introduction',
    '-- Plugin Branches': {
        'type': 'separator',
        'title': 'Plugin Branches',
    },
    ...renderPluginItems({ display: false }),
    'plugins': {
        title: 'Plugin Branches',
        type: 'folder',
        items: renderPluginItems({ display: true }),
    },
    '-- FullProduct.dev ⚡️': {
        'type': 'separator',
        'title': 'FullProduct.dev ⚡️ Upgrade',
    },
    'quickstart': {
        'title': 'Quickstart',
    },
    'core-concepts': {
        'title': 'Core Concepts',
    },
    'project-structure': {
        'title': 'Project Structure',
    },
    'single-sources-of-truth': {
        'title': 'Single Sources of Truth',
    },
    '-- Application Features': {
        'type': 'separator',
        'title': 'Application Features',
    },
    '@app-core': '@app/core',
}

export default meta
