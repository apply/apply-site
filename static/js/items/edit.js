var file = require('file')
  , $ = require('jQuery');

$(function () {
 $('form').submit(function() { 
    var data = $(this).serialize();
    var action = $(this).attr('action');
    var id = window.location.pathname.split('/')[2];

    $.ajax({
      type:'POST',
      url:'/tojson',
      data: data,
      dataType:'json',
      success:function(blob) {
        $.ajax({
          type:'POST',
          url:action,
          data: JSON.stringify({fields:blob}),
          dataType:'json',
          success:function(blob) {
            window.location = '/blobs/'+blob.id;
          }
        });
      }
    });
    return false;
  });

  file('a.js_file', {
    select: function (url, file_name) {
      $('a.js_file').text('uploading ' + file_name + '...').attr('disabled', true).fadeTo(100, 0.5);
      $('.submit').attr('disabled', true).fadeTo(100, 0.5);
    }
  , upload: function (url, file_name) {
      $('a.js_file')
        .text('upload file')
        .attr('disabled', true)
        .fadeTo(100, 1)
        .after('<div class="box warning">' + file_name + '</div>');
      $('.submit').attr('disabled', false).fadeTo(100, 1);
    }
  });
});
