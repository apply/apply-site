var server = require('router').create();
var api = require('./api-server');
var bark = require('bark');
var common = require('common');
var curly = require('curly');
var url = require('url');
var querystring = require('querystring');

var noop = function() {};
var port = 8888;
var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

server.get('/css/vendor/*.css', bark.file('./static/style/vendor/{*}.css'));
server.get('/css/*.css', bark.stylus('./static/style/{*}.styl'));
server.get('/js/*', bark.rex('./static/js/{*}'));
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

function renderView(location, locals) {
  return function(request, response) {
  		// consoel.log query string
  		
		var query = url.parse(request.url, true).query;
		var qs = '?' + querystring.stringify(query);

		common.step([
			function(next) {
				curly.get('localhost:' + port + '/api/blobs/{blob}', request.params).json(next.parallel());
				curly.get('localhost:' + port + '/api/blobs/{blob}/items' + qs, request.params).json(next.parallel());
			},
			function(result) {
        locals = common.join(locals, {items: result[1], blob: result[0]}) || {};
        if (!locals.css && result[0].view) {
          locals.css = [];
          locals.css.push('blobs/' + result[0].view);
        }
				render(location, locals)(request, response);
			}
		], function(err) {
			bark.jade('./views/404.jade')(request, response);	
		});
	}
};

function renderItem(location, locals) {
	return function(request, response) {
		common.step([
			function(next) {
				curly.get('localhost:' + port + '/api/items/{item}', request.params).json(next);
			},
			function(item) {
        locals = common.join(locals, {item: item}) || {};
				render(location, locals)(request, response);
			}
		], function(err) {
			bark.jade('./jade/404.jade')(request, response);
		});
	}
}
server.get('/', render('./views/index.jade', {css: ['index']}));

// create blob
server.get('/blobs/create', render('./views/blobs/create.jade',{types: types, css: ['blobs/create'], js: ['blobs/create']}));

// select view
server.get('/blobs/{blob}/view', function(request, response) {
	common.step([
		function(next) {
			curly.get('localhost:'+port+'/api/blobs/{blob}', request.params).json(next);
		},
		function(blob) {
			render('./views/blobs/view.jade', {css: ['blobs/view'], js:['blobs/view'], blob:blob})(request, response);
		}
	], function(err) {		
		bark.jade('./jade/404.jade')(request, response);
	})
});

// blob view
server.get('/blobs/{blob}', function(request, response) {
	common.step([
		function(next) {
			curly.get('localhost:' + port + '/api/blobs/{blob}/view', request.params).json(next);
		},
		function(blob) {
			if(blob.view) {
				renderView('./views/blobs/' + blob.view + '.jade')(request, response);	
				return;
			}
			request.url = common.format('/blobs/{blob}/view',request.params);
//			renderView('./views/blobs/' + blob.view + '.jade')(request, response);
			server.route(request, response);
		}
	], function(err) {
		bark.jade('./jade/404.jade')(request, response);
	});
});
server.get('/blobs/{blob}/grid', renderView('./views/blobs/grid.jade', {css: ['blobs/grid']}));
server.get('/blobs/{blob}/tabular', renderView('./views/blobs/tabular.jade', {js: ['blobs/tabular']}));
server.get('/blobs/{blob}/map', renderView('./views/blobs/map.jade', {css: ['blobs/map'], js: ['blobs/map']}));
server.get('/blobs/{blob}/gallery', renderView('./views/blobs/gallery.jade', {css: ['blobs/gallery']}));

// items
server.get('/blobs/{blob_id}/items/create', render('./views/blobs/items/create.jade', {css: ['vendor/jquery-ui']}));
server.get('/items/{item}', renderItem('./views/blobs/items/show.jade', {css: ['items/show']}));
server.get('/items/{item}/edit', renderItem('./views/blobs/items/edit.jade', {css: ['vendor/jquery-ui'], js: ['items/edit']}));

api.listen(server);

server.listen(8888);
