var server = require('router').create();
var bark = require('bark');
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10041/apply', ['types']);

var noop = function() {};

server.get('/css/*.css', bark.stylus('./static/style/{*}.styl'));

var echo = function(request, response) {
	response.writeHead(200);
	response.end(JSON.stringify({url:request.url, params:request.params}));
};

server.get('/', echo);

server.get('/blob/create', echo); // create view
server.get('/blob/{id}/create', echo); // create item

server.get('/blob/{id}/view', echo); // select view

server.get('/blob/{id}/grid', echo);
server.get('/blob/{id}/tabular', echo);
server.get('/blob/{id}/map', echo);
server.get('/blob/{id}/gallery', echo);

server.get('/item/{id}', echo);
server.get('/item/{id}/edit', echo);

server.listen(8888);
