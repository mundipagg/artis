const errorOverlayMiddleware = require('react-dev-utils/errorOverlayMiddleware')
const config = require('./webpack.config.dev')
const paths = require('./paths')

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http'
const host = process.env.HOST || '0.0.0.0'

module.exports = (proxy, allowedHost) => ({
  disableHostCheck:
    !proxy || process.env.DANGEROUSLY_DISABLE_HOST_CHECK === 'true',
  compress: true,
  clientLogLevel: 'none',
  contentBase: paths.appPublic,
  watchContentBase: true,
  hot: true,
  publicPath: config.output.publicPath,
  quiet: true,
  watchOptions: {
    ignored: /node_modules/,
  },
  https: protocol === 'https',
  host,
  overlay: false,
  historyApiFallback: {
    disableDotRule: true,
  },
  public: allowedHost,
  proxy,
  setup (app) {
    app.use(errorOverlayMiddleware())
  },
})
