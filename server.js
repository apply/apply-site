var server = require('router').create();
var api = require('./api-server');
var bark = require('bark');
var common = require('common');


var noop = function() {};
var apihost = 'localhost';
var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

server.get('/css/*.css', bark.stylus('./static/style/{*}.styl'));
server.get('/js/*', bark.rex('./static/js/*'));
server.get('/images/*', bark.file('./static/images/{*}'));

var echo = function(request, response) {
  response.writeHead(200);
  response.end(JSON.stringify({url:request.url, params:request.params}));
};

function render(location, locals) {
  return function (request, response) {
    locals = common.join(locals, require('./helpers/static')) || {};
    require('fs').readFile(common.format(location, request.params), 'utf-8', function (error, src) {
      locals.body = require('jade').compile(src, {self: true})(locals);
      bark.jade('./views/layout.jade', locals)(request, response);
    });
  }
}

function renderView(location) {
	return 	function(request, response) {
		common.step([
			function(next) {
				curly.get('localhost:' + port + '/api/blob/{blob}', request.params).json(next.parallel());
				curly.get('localhost:' + port + '/api/blob/{blob}/items', request.params).json(next.parallel());
			},
			function(result) {
				var blob = result[0];
				var items = result[1];
				render(location,{item: item, blob: blob})(request, response);
			}
		], function(err) {
			bark.jade('./views/404.jade')(request, response);	
		});
	}
};

function renderItem(location) {
	return function(request, response) {
		common.step([
			function(next) {
				curly.get('localhost:' + port + '/api/items/{item}', reuquest.params).json(next);
			},
			function(item) {
				render(location,{item: item})(request, response);
			}
		], function(err) {
			bark.jade('./jade/404.jade')(request, response);
		});
	}
}
server.get('/', render('./views/index.jade'));

// create blob
server.get('/blobs/create', render('./views/blobs/create.jade',{types: types}));

// select view
server.get('/blobs/{id}/view', render('./views/blobs/view.jade'));

// blob view
server.get('/blobs/{blob}', function(request, reponse) {
	common.step([
		function(next) {
			curly.get('localhost:' + port + '/api/blobs/{blob}/view').json(next);
		},
		function(blob) {
			renderView('./views/blobs/' + blob.view + '.jade');
		}
	], function(err) {
		bark.jade('./jade/404.jade')(request, response);
	});
});
server.get('/blobs/{blob}/grid', renderView('./views/blobs/grid.jade'));
server.get('/blobs/{blob}/tabular', renderView('./views/blobs/tabular.jade'));
server.get('/blobs/{blob}/map', renderView('./views/blobs/map.jade'));
server.get('/blobs/{blob}/gallery', renderView('./views/blobs/gallery.jade'));

// items
server.get('/blobs/{blob}/items/create', render('./views/items/create.jade'));
server.get('/items/{item}', renderItem('./view/items/item.jade'));
server.get('/items/{item}/edit', renderItem('./view/items/edit.jade'));

api.listen(server);

server.listen(8888);
