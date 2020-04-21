
module.exports = {

    publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
    chainWebpack: config => config.plugins.delete('case-sensitive-paths'),
 
  outputDir: "mycli3",
  assetsDir: "assets",

  filenameHashing: false,

  lintOnSave: true,

  productionSourceMap: false,
 

  devServer: {
    host: "localhost",
    port: 2020,
    https: false, 
    open: true, 

    proxy: {
      "/api": {
        target: "http://localhost:5050",
        ws: true,
        changeOrigin: true, 
        pathRewrite: {
            '^/api': '' 
          }
      },
      '/foo': { 
      target: 'https://3d.bk.tudelft.nl', 
      changeOrigin: true, 
      pathRewrite: { 
          '^/foo': '' 
      }
    }
    }
  }
}; 

