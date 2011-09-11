var $ = require('jQuery', 'jQuery.file.button');

var host = window.location.protocol === 'file:' ? 'localhost:8888' : window.location.host;

module.exports = function(selector, fn) {
	$(selector).file(function(input) {
		var name = Math.random().toString(36).substr(2) + '.' + $(input).val().split('.').pop().toLowerCase();

		var iframe = $('<iframe name="'+name+'" id="'+name+'"></iframe>').hide().appendTo('body');
		var form = $('<form target="'+name+'" method="POST" enctype="multipart/form-data" action="http://'+host+'/api/file/'+name+'"></form>')
					.hide().appendTo('body');

		input.name = input.id = name+'-input';
		form.append(input);

		form.submit();

		iframe.load(function() {
			setTimeout(function() {
				form.remove();
				iframe.remove();
			}, 500);

			fn('http://'+host+'/api/file/'+name);
		});
	});
};