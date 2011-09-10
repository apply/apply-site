var server = require('router').create();
var api = require('./api-server');
var bark = require('bark');
var common = require('common');

var noop = function() {};

server.get('/css/*.css', bark.stylus('./static/style/{*}.styl'));
server.get('/js/*', bark.rex('./static/js/*'));

var echo = function(request, response) {
	response.writeHead(200);
	response.end(JSON.stringify({url:request.url, params:request.params}));
};

server.get('/', echo);

// create blob
server.get('/blobs/create', echo);

// select view
server.get('/blobs/{id}/view', echo);

// blob view
server.get('/blobs/{id}', echo);
server.get('/blobs/{blob}/grid', echo);
server.get('/blobs/{blob}/tabular', echo);
server.get('/blobs/{blob}/map', echo);
server.get('/blobs/{blob}/gallery', echo);

// items
server.get('/blobs/{blob}/items/create', echo);
server.get('/items/{item}', echo);
server.get('/items/{item}/edit', echo);

api.listen(server);

server.listen(8888);