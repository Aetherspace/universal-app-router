// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            ['@babel.plugin-transform-react-jsx', {
                runtime: 'automatic',
                importSource: 'nativewind',
                jsxImportSource: 'nativewind',
            }]
        ]
    }
}
