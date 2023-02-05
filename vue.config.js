module.exports = {
  chainWebpack: config => {
    config.when(process.env.NODE_ENV === 'production',
      // 为生产环境修改配置...
      config => {
        config.plugin('html').tap(args => {
          args[0].title = '猛犸运维系统平台'
          return args
        })
      },
      // 为开发环境修改配置...
      config => {
        config.devServer.proxy({
          '/api/v1': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            pathRewrite: { '^/api/v1': '' }
          }
        })
        config.plugin('html').tap(args => {
          args[0].title = '猛犸运维系统平台-dev'
          return args
        })
      }
    )
  }
}