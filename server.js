var server = require('router').create();
var bark = require('bark');
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10041/apply', ['types']);

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

// api

// blob create
server.post('/api/blobs', echo);
server.post('/api/blobs/{blob}/view', echo);

// blob view
server.get('/api/blobs/{blob}', echo);
server.get('/api/blobs/{blob}/items', echo);

// items
server.post('/api/blobs/{blob}/items', echo);
server.get('/api/blobs/{blob}/items/{item}', echo);

server.listen(8888);