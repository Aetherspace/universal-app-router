import { useRouter } from 'next/router'

/* --- Styles ---------------------------------------------------------------------------------- */

const styles = {
    footer: {
        verticalAlign: 'middle',
    },
    tagLink: {
        padding: '3px 8px',
        backgroundColor: '#333333',
        borderRadius: '4px',
    },
}

/* --- Theme ----------------------------------------------------------------------------------- */

/** @type {import('nextra-theme-docs').DocsThemeConfig} */
export default {
    logo: <span><strong>FullProduct.dev</strong> ⚡️ Universal Base Starter</span>,
    project: {
        link: 'https://github.com/Aetherspace/universal-app-router',
        title: 'Universal Base Starter - FullProduct.dev',
    },
    footer: {
        text: <span>Need a <strong>Full-Product</strong> / Universal App Setup? 🚀 Check out <a href="https://codinsonn.dev" target="_blank" style={{ ...styles.tagLink, fontWeight: 'bold' }}>FullProduct.dev</a> by <a href="https://codinsonn.dev" target="_blank" style={styles.tagLink}>Thorr ⚡️ codinsonn</a></span>
    },
    navigation: true,
    sidebar: {
        autoCollapse: true,
        defaultMenuCollapseLevel: 2,
        toggleButton: true,  
    },
    useNextSeoProps() {
        const { asPath } = useRouter()
        if (asPath === '/') {
            return {
                title: 'FullProduct.dev ⚡️ Universal Base Starter',
            }
        } else if (asPath.includes('plugins')) {
            return {
                titleTemplate: 'FullProduct.dev ⚡️ %s Plugin - Universal Base Starter Docs',
            }
        }
        return {
            titleTemplate: 'FullProduct.dev | %s - Universal Base Starter Docs',
        }
    }
}
