	common.step([
		function(next) {
			curly.get('api/blob/{blob}', request.params).json(next.parallel());
			curly.get('api/blob/{blob}/items', request.params).json(next.parallel());
		},
		function(result) {
			var blob = result[0];
			var items = result[1];
			bark.jade('./views/grid.jade',{items: items, blob: blob})(request, response);
		}
	], function(err) {
		bark.jade('./views/404.jade')(request, response);	
	});