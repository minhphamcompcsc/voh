const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app : any) {
  app.use(
    '/flask',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
    })
  );
  app.use(
    '/socket',
    createProxyMiddleware({
      target: 'http://localhost:5001',
      changeOrigin: true,
    })
  );
};