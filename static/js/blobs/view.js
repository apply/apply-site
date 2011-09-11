var $ = require('jQuery');

$(function() {
	$('form').submit(function() {
		return false;
	});
	$('input.button').click(function() {
		var view = $(this).parent().find('.radio').val();

		$.ajax({
			type:'POST',
			url:'/api/blobs/'+window.location.pathname.split('/').pop()+'/view',
			data: JSON.stringify({view:view}),
			dataType:'json',
			success:function() {
				window.location = '/blobs/'+window.location.pathname.split('/').pop()+'?reload'
			}
		})
	});
});