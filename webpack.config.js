let path = require('path')

module.exports = {
    entry: './src/index.ts',
    devtool: 'inline-source-map',
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'webpack.bundle.js',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    experiments: {
        topLevelAwait: true,
    },
}
