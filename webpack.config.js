const path = require( 'path' );
const nodeExternals = require('webpack-node-externals');

module.exports = {
    // mode: 'production',
    mode: 'development',
    target: 'node',
    externals: [nodeExternals()],
    devtool: 'eval-source-map',
    entry: './src/app.ts',
    output: {
        path: path.resolve( __dirname, 'dist' ),
        filename: 'app.js',
    },
    resolve: {
        extensions: [ '.ts', '.tsx', '.js', '.json' ],
    },
    module: {
        rules: [
            // { -------------------- Option 1
            //     test: /\.tsx?$/,
            //     use: 'ts-loader',
            //     exclude: /node_modules/,
            // }
            { // -------------------- Option 2
                test: /\.(ts|js)x?$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            }
        ]
    },
    experiments:{
        topLevelAwait: true
    }
};