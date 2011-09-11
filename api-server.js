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
	if (!fn) {
		return jsonize(required);
	}
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

var types = ['short_text', 'rich_text', 'date', 'duration', 'number', 'picture', 'file', 'location', 'multiple_choice', 'single_choice', 'link'];

var mapping = {
	map: ['location'],
	grid: ['short_text', 'rich_text', 'date', 'duration', 'number', 'file', 'multiple_choice', 'single_choice', 'link'],
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

	// items
	server.get('/api/blobs/{blob}/items', jsonize(function(request, respond) {
		db.items.find({blobid:request.params.blob}, {_id:0}, callbackify(respond));
	}));
	server.post('/api/blobs/{blob}/items', onpost({fields:1}, function(request, item, respond) {
		item.blobid = request.params.blob;
		item.id = id();
		item.createdAt = item.updatedAt = now();

		db.items.save(item, successify(respond));
	}));

	server.get('/api/items/{item}', jsonize(function(request, respond) {
		db.items.findOne({id:request.params.item}, {_id:0}, callbackify(respond));
	}));
	server.post('/api/items/{item}', onpost({fields:1}, function(request, item, respond) {
		db.items.update({id:request.params.item}, {$set:{fields:item.fields, updatedAt:now()}}, successify(respond));
	}));
};
