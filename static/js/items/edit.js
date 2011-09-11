var file = require('file')
  , $ = require('jQuery');

$(function () {
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
