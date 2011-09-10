var jsonize = require('jsonize');
var common = require('common');
var db = require('mongojs').connect('mongodb://root:root@staff.mongohq.com:10041/apply', ['blobs', 'items']);

var callbackify = function(respond) {
	return function(err, data) {
		if (err) {
			respond(500, {error:'something bad happended'});
			return;
		}
		respond(data);
	};
};
var now = function() {
	return (Date.now() / 1000) | 0;
};
var id = function() {
	return common.encode(Date.now()) + Math.random().toString(36).substr(2);	
};
var onpost = function(required, fn) {
	return jsonize(function(request, blob, respond) {
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

exports.listen = function(server) {
	// blob create
	server.post('/api/blobs', onpost({name:1, itemName:1, types:1}, function(request, blob, respond) {
		blob.id = id();
		blob.createdAt = now();

		db.blobs.save(blob);

		respond(blob);
	}));
	server.get('/api/blobs', jsonize(function(request, respond) { // for debugging
		db.blobs.find({_id:0}, callbackify(respond));
	}));

	server.post('/api/blobs/{blob}/view', onpost({view:1}, function(request, blob, respond) {
		if (!(blob.view in {map:1, tabular:1, grid:1, gallery:1})) {
			respond(400, {error:'invalid view'});
			return;
		}

		db.blobs.update({id:request.params.blob}, {$set:{view:blob.view}}, callbackify(respond));
	}));

	// blob view
	server.get('/api/blobs/{blob}', jsonize(function(request, respond) {
		db.blobs.findOne({id:request.params.blob}, {_id:0}, callbackify(respond));
	}));
	server.get('/api/blobs/{blob}/items', jsonize(function(request, respond) {
		db.items.find({blobid:request.params.blob}, {_id:0}, callbackify(respond));
	}));

	// items
	server.post('/api/blobs/{blob}/items', onpost({fields:1}, function(request, item, respond) {
		item.blobid = request.params.blob;
		item.id = id();
		item.createdAt = item.updatedAt = now();

		db.items.save(item, callbackify(respond));
	}));
	server.get('/api/blobs/{blob}/items/{item}', jsonize(function(request, respond) {
		db.items.findOne({blobid:request.params.blob, id:request.params.item}, {_id:0}, callbackify(respond));
	}));
};
