var $ = require('jQuery', 'jQuery.file.button');

var host = window.location.protocol === 'file:' ? 'localhost:8888' : window.location.host;
var noop = function() {};

module.exports = function(selector, map) {
	if (typeof map !== 'object') {
		var tmp = {};

		tmp.upload = map;
		map = tmp;
	}

	map.upload = map.upload || noop;
	map.select = map.select || noop;

	$(selector).file(function(input) {
		var filename = $(input).val().split('/').pop().split('\\').pop();
		var name = Math.random().toString(36).substr(2) + '.' + $(input).val().split('.').pop().toLowerCase();
		var url = 'http://'+host+'/api/file/'+name;

		map.select(url, filename);

		var iframe = $('<iframe name="'+name+'" id="'+name+'"></iframe>').hide().appendTo('body');
		var form = $('<form target="'+name+'" method="POST" enctype="multipart/form-data" action="'+url+'"></form>')
					.hide().appendTo('body');

		input.name = input.id = name+'-input';
		form.append(input);

		form.submit();

		iframe.load(function() {
			setTimeout(function() {
				form.remove();
				iframe.remove();
			}, 500);

			map.upload(url + ((/\.(png)|(jpeg)|(jpg)|(gif)/i).test(filename) ? '?width=900' : ''), filename);
		});
	});
};