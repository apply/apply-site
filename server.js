var server = require('router').create();
var api = require('./api-server');
var bark = require('bark');
var common = require('common');

var noop = function() {};
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

server.get('/', render('./views/index.jade'));

// create blob
server.get('/blobs/create', render('./views/blobs/create.jade',{types: types}));

// select view
server.get('/blobs/{id}/view', render('./views/blobs/view.jade'));

// blob view
server.get('/blobs/{blob_id}', echo);
server.get('/blobs/{blob_id}/grid', render('./views/blobs/grid.jade'));
server.get('/blobs/{blob_id}/tabular', render('./views/blobs/tabular.jade'));
server.get('/blobs/{blob_id}/map', render('./views/blobs/map.jade'));
server.get('/blobs/{blob_id}/gallery', render('./views/blobs/gallery.jade'));

// items
server.get('/blobs/{blob_id}/items/create', render('./views/blobs/items/create.jade'));
server.get('/blobs/{blob_id}/items/{item_id}', render('./views/blobs/items/show.jade'));
server.get('/blobs/{blob_id}/items/{item_id}/edit', render('./views/blobs/items/edit.jade'));

api.listen(server);

server.listen(8888);
