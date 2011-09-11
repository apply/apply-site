var $ = require('jQuery');
require('jquery-ui');

$(function () {
  $('#full_text a.arrow').click(function () {
    $(this).parent().parent().toggleClass('open');
    return false;
  });

  $('.datepicker').datepicker();
});
