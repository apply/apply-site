var $ = require('jQuery');

$(function () {
  $('#full_text a.arrow').click(function () {
    $(this).parent().parent().toggleClass('open');
    return false;
  });
});
