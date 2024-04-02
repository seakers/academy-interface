
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  plugins: [
    new webpack.DefinePlugin({
        'API_URL': JSON.stringify('http://localhost:8000/api/'),
        'WS_URL': JSON.stringify('ws://localhost:8000/api/'),
        // 'GRAPH_QL_URL': JSON.stringify('http://localhost:8000/v1/graphql'),
        // 'GRAPH_QL_URL': JSON.stringify('https://academy.selva-research.com/graphql/v1/graphql'),
        'GRAPH_QL_WS_URL': JSON.stringify('ws://localhost:6002/v1/graphql'),
        // 'GRAPH_QL_WS_URL': JSON.stringify('wss://academy.selva-research.com/graphql/v1/graphql'),
        'GRAPH_QL_WS_URL_SUB': JSON.stringify('ws://localhost:6002/subscriptions'),
        // 'GRAPH_QL_WS_URL_SUB': JSON.stringify('wss://academy.selva-research.com/graphql/subscriptions'),
    })
  ],
  devtool: 'inline-source-map',
  devServer: {
    host: '127.0.0.1',
      allowedHosts: [
          'academy',
          '127.0.0.1'
      ],
    proxy: {
        '/api': {
            target: 'https://127.0.0.1:8000/',
            changeOrigin: true,
            ws: true
        },
        '/server': {
            target: 'http://127.0.0.1:8000/',
            changeOrigin: true,
            ws: true
        },
        '/static': {
            target: 'http://127.0.0.1:8000/',
            changeOrigin: true,
            ws: true
        }
    },
    contentBase: './dist',
  },
});