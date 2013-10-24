var url = require('url');
var http = require('http');
var fs = require('fs');
var express = require('express');

var http_port = 80;

// set default app options
var app = express.createServer(express.logger());

// routes
app.all('*', function(req, res) {
    try {

            // destination mapped to a port on localhost
            var uri = url.parse(req.url, true);
            var headers = { authorization: req.headers.authorization, cookie: req.headers.cookie };
            if(req.headers['content-type']) {
                headers['content-type'] = req.headers['content-type'];
            }
            if(req.headers['content-length']) {
                headers['content-length'] = req.headers['content-length'];
            }
            var proxy_request = http.request({
                host: 'localhost',
                port: 3000,
                path: uri.pathname + uri.search,
                method: req.method,
                headers: headers
            }, function(proxy_response) {
                proxy_response.pipe(res);
                res.writeHead(proxy_response.statusCode, proxy_response.headers);
            }).on('error', function(error) {
                console.log('REQUEST FAILED: localhost:' + destination + uri.pathname + uri.search + ', ' + error.message);
                res.send(error.message.split(',')[1] || 'Request failed', 404);
            });
            req.pipe(proxy_request);
    } catch (e) {
        res.send(e.message, 500);
    }
});

// start server
app.listen(http_port);
console.log('Server running on ' + http_port.toString());
