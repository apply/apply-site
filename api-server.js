var jsonize = require('jsonize');
var common = require('common');
var curly = require('curly');
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10041/apply', ['blobs', 'items']);
var pubsub = require('pubsub.io').connect('hub.pubsub.io/apply');
var url = require('url');

var callbackify = function(respond) {
	return function(err, data) {
		if (err) {
			respond(500, {error:'something bad happended'});
			return;
		}
		respond(data);
	};
};
var successify = function(respond) {
	return function(err, data) {
		if (err) {
			respond(500, {error:'something bad happended', success:false});
			return;
		}
		respond({success:true});
	};
};
var now = function() {
	return (Date.now() / 1000) | 0;
};
var id = function() {
	return common.encode(Date.now()) + Math.random().toString(36).substr(2);	
};
var onpost = function(required, fn) {
	return jsonize(!fn ? required : function(request, blob, respond) {
		var result = {};

		for (var i in required) {
			if (!blob[i]) {
				respond(400, {error:'data looks weird', required:Object.keys(required)});
				return;
			}
			result[i] = blob[i];
		}

		fn(request, result, respond);
	});
};

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var mapping = {
	map: ['location'],
	grid: ['short_text', 'rich_text', 'date', 'duration', 'number', 'multiple_choice', 'single_choice'],
	gallery: ['picture'],
	tabular: ['short_text', 'date', 'duration', 'number', 'multiple_choice', 'single_choice', 'link']
};


exports.listen = function(server) {
	// blob create
	server.post('/api/blobs', onpost({name:1, itemName:1, types:1}, function(request, blob, respond) {
		blob.id = id();
		blob.createdAt = now();

		var available = [];

		for (var view in mapping) {
			for (var i = 0; i < blob.types.length; i++) {
				if (mapping[view].indexOf(blob.types[i].type) > -1) {
					available.push(view);
					break;
				}
			}
		}

		blob.availableViews = available;

		db.blobs.save(blob, function() {
			delete blob._id;

			respond(blob);
		});
	}));
	server.get('/api/blobs', jsonize(function(request, respond) { // for debugging
		db.blobs.find({}, {_id:0}, callbackify(respond));
	}));

	server.get('/api/blobs/{blob}/view', jsonize(function(request, respond) {
		db.blobs.findOne({id:request.params.blob}, {_id:0, view:1}, callbackify(respond));
	}));
	server.post('/api/blobs/{blob}/view', onpost({view:1}, function(request, blob, respond) {
		if (!(blob.view in {map:1, tabular:1, grid:1, gallery:1})) {
			respond(400, {error:'invalid view'});
			return;
		}

		db.blobs.update({id:request.params.blob}, {$set:{view:blob.view}}, successify(respond));
	}));

	// blob view
	server.get('/api/blobs/{blob}', jsonize(function(request, respond) {
		db.blobs.findOne({id:request.params.blob}, {_id:0}, callbackify(respond));
	}));

	var normalize = function(blob, item) {
		if (!blob) {
			return false;
		}

		var map = {};

		blob.types.forEach(function(type) {
			map[type.name] = type;
		});

		item.fields = item.fields.map(function(field) {
			var type = map[field.name];

			if (type.type === 'location') {
        field.value = {lat: (field.value || '').split(';')[0], lng: (field.value || '').split(';')[1]};
      }

			if (type.options) {
				field.options = type.options;
			}
			field.type = type.type;

			return field;
		});

		return item;
	};

	// items
	server.get('/api/blobs/{blob}/items', jsonize(function(request, respond) {
		var qs = url.parse(request.url, true).query;
		var search = qs['search[full_text]'];
		
		respond = callbackify(respond);

		if(search) {
			common.step([
				function(next) {
					db.items.find({blobid:request.params.blob}, {_id:0}, next);
				},
				function(items) {
					var is = [];
					items.forEach(function(item) {
						var found = false;
						item.fields.forEach(function(field) {
							if((field.value + '').toLowerCase().indexOf(search.toLowerCase()) > -1) {
								found = true;
							}
						});
						if(found) {
							is.push(item);
						}
					});
					respond(null,is);
				}
			], respond );

			return;	
		}
		

		db.items.find({blobid:request.params.blob}, {_id:0}, respond);
	}));
	server.post('/api/blobs/{blob}/items', onpost({fields:1}, function(request, item, respond) {
		item.blobid = request.params.blob;
		item.id = id();
		item.createdAt = item.updatedAt = now();

		respond = callbackify(respond);

		common.step([
			function(next) {
				db.blobs.findOne({id:item.blobid}, next);
			},
			function(blob) {
				item = normalize(blob, item);

				if (!item) {
					respond(new Error('oh no'));
					return
				}
				db.items.save(item, function(err) {
					respond(err, !err && {success:true, blobid:blob.id});
				});
			}
		], respond);

	}));

	server.get('/api/items/{item}', jsonize(function(request, respond) {
		db.items.findOne({id:request.params.item}, {_id:0}, callbackify(respond));
	}));
	server.post('/api/items/{item}', onpost({fields:1}, function(request, item, respond) {
		respond = callbackify(respond);

		common.step([
			function(next) {
				db.items.findOne({id:request.params.item}, next);
			},
			function(item, next) {
				db.blobs.findOne({id:item.blobid}, next);				
			},
			function(blob) {
				item = normalize(blob, item);

				if (!item) {
					respond(new Error('oh no'));
					return;
				}
				pubsub.publish(item);
				db.items.update({id:request.params.item}, {$set:{fields:item.fields, updatedAt:now()}}, function(err) {
					respond(err, !err && {success:true, blobid:blob.id});
				});
			}
		], respond);
	}));

	var GETT_TOKEN = 'dUx0ampKOUk4ODJDZTZEb1lwcGgybTZVQUw3ampNSHRxdDkyMy1kc0BvcGVuLC1XNnZ5c0Ixdy1BdDdCLVp0YkNNcGQ3dUJ1SWpDaElnc0dN';
	var SHARE = '9c9Uud7';

	server.get('/api/file/{filename}', function(request, response) {
		var name = request.params.filename;
		var query = require('url').parse(request.url, true).query;

		common.step([
			function(next) {
				curly.get('http://api.ge.tt/0/{0}/{1}/translate', SHARE, name).json(next);
			},
			function(file) {
				var suffix = (query.width || query.height) ? '/scale/' + (query.width || '') + 'x' + (query.height || '') : '';

				curly.get('http://api.ge.tt/0/{0}/{1}/blob'+suffix, SHARE, file.fileid).proxy(response);
			}
		], function() {
			response.writeHead(404);
			response.end();
		});
	});
	server.post('/api/file/{filename}', function(request, response) {
		var name = request.params.filename;
		var buf;
		var ended = false;

		request.pause();

		request.once('data', function(data) {
			buf = data;
		});
		request.once('end', function() {
			ended = true;
		});

		common.step([
			function(next) {
				curly.get('http://api.ge.tt/1/{0}/create', SHARE).query({token:GETT_TOKEN, filename:name}).json(next);
			},
			function(file) {
				delete request.headers.host;

				var post = curly.post(file.uploadurl).headers(request.headers);
				var onend = function() {
					response.writeHead(200, {'content-type':'text/html'});
					response.end('<!DOCTYPE html><html><head></head><body></body></html>');
				};

				request.resume();

				if (buf) {
					post.write(buf);
				}
				if (ended) {
					post.end();
					onend();
				} else {
					request.pipe(post);
					request.on('end', onend);
				}
			}
		], function() {
			response.writeHead(500);
			response.end();
		});
	});
};
