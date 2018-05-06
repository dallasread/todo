var path = require('path'),
    webpack = require('webpack'),
    isProduction = process.argv.indexOf('-p') !== -1,
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    extractSass = new ExtractTextPlugin({
        filename: './assets/application.min.css'
    });

var js = {
    entry: ['./index.js'],
    output: { filename: './assets/application.min.js' },
    module: {
        loaders: [
            { test: /\.json$/, loader: 'json-loader' },
            { test: /\.html$/, loader: 'html-loader?minimize=false' },
            { test: /\.png$/,  loader: 'url-loader?mimetype=image/png' },
            { test: /\.gif$/,  loader: 'url-loader?mimetype=image/gif' },
            { test: /\.svg$/,  loader: 'url-loader?mimetype=image/svg+xml' },
            { test: /\.jpeg|\.jpg$/, loader: 'url-loader?mimetype=image/jpeg' },
        ],
    },
    node: {
        fs: 'empty'
    }
};

var css = {
    entry: ['./index.scss'],
    output: { filename: '../tmp/style.css' },
    module: {
        rules: [{
            test: /\.scss|\.css$/,
            use: extractSass.extract({
                use: [{
                    loader: 'css-loader'
                }, {
                    loader: 'sass-loader'
                }],
                fallback: 'style-loader'
            })
        }]
    },
    plugins: [
        extractSass
    ]
};

module.exports = [js, css];
