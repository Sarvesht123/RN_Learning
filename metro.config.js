const http = require('node:http');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const defaultEnhanceMiddleware = config.server.enhanceMiddleware;

config.server.enhanceMiddleware = (middleware, metroServer) => {
  const enhanced = defaultEnhanceMiddleware
    ? defaultEnhanceMiddleware(middleware, metroServer)
    : middleware;

  return (request, response, next) => {
    if (request.url !== '/graphql-proxy') {
      return enhanced(request, response, next);
    }

    const headers = { ...request.headers, host: 'aed.staging.com' };
    delete headers.origin;
    delete headers.referer;

    const proxyRequest = http.request(
      {
        hostname: 'aed.staging.com',
        port: 80,
        path: '/graphql',
        method: request.method,
        headers,
      },
      (proxyResponse) => {
        response.writeHead(proxyResponse.statusCode ?? 502, proxyResponse.headers);
        proxyResponse.pipe(response);
      },
    );

    proxyRequest.on('error', (error) => {
      response.writeHead(502, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ errors: [{ message: error.message }] }));
    });
    request.pipe(proxyRequest);
  };
};

module.exports = config;
