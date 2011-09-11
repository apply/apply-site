var server = require('router').create();
var api = require('./api-server');
var bark = require('bark');
var common = require('common');
var curly = require('curly');
var url = require('url');
var querystring = require('querystring');
var buffoon = require('buffoon');

var noop = function() {};
var port = 8888;
var host = 'localhost:'+port;

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
				curly.get(host + '/api/blobs/{blob}', request.params).json(next.parallel());
				curly.get(host + '/api/blobs/{blob}/items' + qs, request.params).json(next.parallel());
			},
			function(result) {
        locals = common.join(locals, {items: result[1], blob: result[0]}) || {};

        if (!locals.css && result[0].view) {
          locals.css = [];
          locals.css.push('blobs/' + result[0].view);
        }

        if (!locals.js && result[0].view) {
          locals.js = [];
          locals.js.push('blobs/' + result[0].view);
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
    var item;
		common.step([
			function(next) {
				curly.get(host + '/api/items/{item}', request.params).json(next);
			},
			function(_item, next) {
        item = _item;
				curly.get(host + '/api/blobs/{blob}', {blob: item.blobid}).json(next);
			},
			function(blob) {
        locals = common.join(locals, {item: item, blob: blob}) || {};
				render(location, locals)(request, response);
			}
		], function(err) {
			bark.jade('./jade/404.jade')(request, response);
		});
	}
}

function renderCreateItem(location, locals) {
  return function(request, response) {
		common.step([
			function(next) {
				curly.get(host + '/api/blobs/{blob}', request.params).json(next);
			},
			function(blob) {
        locals = common.join(locals, {blob: blob}) || {};
				render(location, locals)(request, response);
			}
		], function(err) {
			bark.jade('./views/404.jade')(request, response);	
		});
	}
};

server.get('/', render('./views/index.jade', {css: ['index']}));

// create blob
server.get('/blobs/create', render('./views/blobs/create.jade',{types: types, css: ['blobs/create'], js: ['blobs/create']}));

// select view
server.get('/blobs/{blob}/view', function(request, response) {
	common.step([
		function(next) {
			curly.get(host+'/api/blobs/{blob}', request.params).json(next);
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
			curly.get(host + '/api/blobs/{blob}/view', request.params).json(next);
		},
		function(blob) {
			if (!blob) {
				response.writeHead(404);
				response.end();
				return;
			}
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
server.get('/blobs/{blob}/gallery', renderView('./views/blobs/gallery.jade', {css: ['blobs/gallery'], js: ['blobs/gallery']}));

// items
server.get('/blobs/{blob}/items/create', renderCreateItem('./views/blobs/items/create.jade', {css: ['vendor/jquery-ui'], js: ['items/edit']}));
server.get('/items/{item}', renderItem('./views/blobs/items/show.jade', {css: ['items/show']}));
server.get('/items/{item}/edit', renderItem('./views/blobs/items/edit.jade', {css: ['vendor/jquery-ui'], js: ['items/edit']}));

server.post('/tojson', function(request, response) { //hacky! to help the client side send json
	common.step([
		function(next) {
			buffoon.string(request, next);
		},
		function(str) {
			str = querystring.parse(str);

			var result = [];

			for (var i in str) {
				var item = {};

				item.name = i.match(/\[([^\]]+)\]/)[1];
				item.value = str[i];

				result.push(item);
			}

			response.writeHead(200, {'content-type':'application/json'});
			response.end(JSON.stringify(result));
		}
	], function(err) {
		response.writeHead(500);
		response.end();
	});
});

api.listen(server);

if (process.argv[2]) {
	var net = require('net');
	
	net.createServer(function(sock) {
		sock.pause();

		var cli = net.createConnection(process.argv[2]);

		cli.on('connect', function() {
			sock.resume();
			sock.pipe(cli);
			cli.pipe(sock);
		});

	}).listen(8888);

	server.listen(process.argv[2]);
} else {
	server.listen(8888);
	
}

process.on('uncaughtException', function(err) {
	console.error(err.stack);
})
