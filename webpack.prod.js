
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'production',
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
        'API_URL': JSON.stringify('https://academy2.selva-research.com/api/'),
        'WS_URL': JSON.stringify('wss://academy2.selva-research.com/api/'),
        'GRAPH_QL_URL': JSON.stringify('https://academy2.selva-research.com/graphql/v1/graphql'),
        'GRAPH_QL_WS_URL': JSON.stringify('wss://academy2.selva-research.com/graphql/v1/graphql'),
        'GRAPH_QL_WS_URL_SUB': JSON.stringify('wss://academy2.selva-research.com/graphql/subscriptions'),
    })
  ],
});